#!/usr/bin/env python3
"""Вырезает паузы из видео с телефона: находит тишину через ffmpeg (silencedetect) и склеивает речь.

    python tools/cut_pauses.py input.mp4 output.mp4
    python tools/cut_pauses.py input.mp4 output.mp4 --noise -32 --min-pause 0.35 --pad 0.08 --json cuts.json
    python tools/cut_pauses.py --selftest

Что делает:
1. ffmpeg ищет участки тише порога (--noise, дБ) длиннее --min-pause секунд.
2. Оставляем всё между ними, с небольшим запасом --pad по краям, чтобы не обрезать начало и конец слов.
3. Очень короткие куски (< --min-keep) выбрасываем, близкие — склеиваем в один.
4. Склеиваем одним проходом ffmpeg (trim + concat) с микро-затуханием звука на стыках, чтобы не было щелчков.

--json сохраняет список оставленных отрезков: по нему можно пересчитать тайминги слов для субтитров.
Нужен только ffmpeg и ffprobe в PATH, внешних библиотек нет.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Seg:
    start: float
    end: float

    @property
    def dur(self) -> float:
        return self.end - self.start


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True)


def probe(path: str) -> dict:
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type", "-of", "json", path])
    if r.returncode != 0:
        raise SystemExit(f"ffprobe не открыл файл: {r.stderr.strip()}")
    d = json.loads(r.stdout)
    kinds = {s["codec_type"] for s in d.get("streams", [])}
    return {"duration": float(d["format"]["duration"]), "video": "video" in kinds, "audio": "audio" in kinds}


def detect_silence(path: str, noise_db: float, min_pause: float) -> list[Seg]:
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", f"silencedetect=noise={noise_db}dB:d={min_pause}", "-f", "null", "-"])
    out, start = [], None
    for line in r.stderr.splitlines():
        if m := re.search(r"silence_start: (-?[\d.]+)", line):
            start = max(0.0, float(m.group(1)))
        elif (m := re.search(r"silence_end: ([\d.]+)", line)) and start is not None:
            out.append(Seg(start, float(m.group(1))))
            start = None
    if start is not None:  # тишина до самого конца файла
        out.append(Seg(start, float("inf")))
    return out


def keep_segments(duration: float, silences: list[Seg], pad: float, min_keep: float, merge_gap: float) -> list[Seg]:
    keep, cur = [], 0.0
    for s in silences:
        if s.start > cur:
            keep.append(Seg(cur, s.start))
        cur = min(duration, s.end)
    if cur < duration:
        keep.append(Seg(cur, duration))
    # запас по краям слова
    keep = [Seg(max(0.0, k.start - pad), min(duration, k.end + pad)) for k in keep]
    # склеиваем пересекающиеся и близкие
    merged: list[Seg] = []
    for k in keep:
        if merged and k.start - merged[-1].end <= merge_gap:
            merged[-1].end = max(merged[-1].end, k.end)
        else:
            merged.append(Seg(k.start, k.end))
    return [k for k in merged if k.dur >= min_keep]


def build_filter(segs: list[Seg], has_v: bool, has_a: bool, fade: float = 0.012) -> str:
    parts, labels = [], []
    for i, s in enumerate(segs):
        if has_v:
            parts.append(f"[0:v]trim=start={s.start:.3f}:end={s.end:.3f},setpts=PTS-STARTPTS[v{i}]")
        if has_a:
            f_out = max(0.0, s.dur - fade)
            parts.append(
                f"[0:a]atrim=start={s.start:.3f}:end={s.end:.3f},asetpts=PTS-STARTPTS,"
                f"afade=t=in:d={fade},afade=t=out:st={f_out:.3f}:d={fade}[a{i}]"
            )
        labels.append((f"[v{i}]" if has_v else "") + (f"[a{i}]" if has_a else ""))
    parts.append("".join(labels) + f"concat=n={len(segs)}:v={int(has_v)}:a={int(has_a)}" + ("[v]" if has_v else "") + ("[a]" if has_a else ""))
    return ";".join(parts)


def cut(src: str, dst: str, noise: float, min_pause: float, pad: float, min_keep: float, json_out: str | None) -> dict:
    info = probe(src)
    if not info["audio"]:
        raise SystemExit("В файле нет звука: паузы ищутся по звуку.")
    silences = detect_silence(src, noise, min_pause)
    segs = keep_segments(info["duration"], silences, pad, min_keep, merge_gap=pad * 2)
    if not segs:
        raise SystemExit("Не нашлось речи: попробуйте порог потише, например --noise -40.")
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:  # фильтр в файле: длинные ролики не упрутся в длину командной строки
        f.write(build_filter(segs, info["video"], True))
        script = f.name
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", src, "-filter_complex_script", script]
    if info["video"]:
        cmd += ["-map", "[v]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p"]
    cmd += ["-map", "[a]", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", dst]
    r = run(cmd)
    Path(script).unlink(missing_ok=True)
    if r.returncode != 0:
        raise SystemExit(f"ffmpeg не смог склеить: {r.stderr.strip()[-800:]}")
    kept = sum(s.dur for s in segs)
    report = {
        "input": src,
        "output": dst,
        "duration_in": round(info["duration"], 3),
        "duration_out": round(kept, 3),
        "removed": round(info["duration"] - kept, 3),
        "segments": [{"start": round(s.start, 3), "end": round(s.end, 3)} for s in segs],
    }
    if json_out:
        Path(json_out).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    return report


def selftest() -> None:
    """Делаем ролик 10 с: речь-тон 0–2, 3.5–6, 8–10 с, между ними тишина. Ждём ~6.8 с на выходе."""
    tmp = Path(tempfile.mkdtemp())
    src, dst = str(tmp / "in.mp4"), str(tmp / "out.mp4")
    expr = "0.5*sin(2*PI*440*t)*(between(t,0,2)+between(t,3.5,6)+between(t,8,10))"
    r = run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "testsrc2=s=540x960:r=30:d=10",
             "-f", "lavfi", "-i", f"aevalsrc='{expr}':s=48000:d=10", "-shortest",
             "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p", "-c:a", "aac", src])
    assert r.returncode == 0, r.stderr
    rep = cut(src, dst, noise=-35, min_pause=0.4, pad=0.08, min_keep=0.15, json_out=None)
    out = probe(dst)["duration"]
    expected = 2 + 2.5 + 2 + 0.08 * 4  # три куска речи + запас по краям внутренних стыков
    ok = abs(out - expected) < 0.25 and len(rep["segments"]) == 3
    print(json.dumps({**rep, "probe_out": round(out, 3), "expected": expected, "ok": ok}, ensure_ascii=False, indent=2))
    shutil.rmtree(tmp, ignore_errors=True)
    sys.exit(0 if ok else 1)


def main() -> None:
    ap = argparse.ArgumentParser(description="Вырезает паузы из видео (ffmpeg silencedetect + concat).")
    ap.add_argument("input", nargs="?")
    ap.add_argument("output", nargs="?")
    ap.add_argument("--noise", type=float, default=-35, help="порог тишины, дБ (по умолчанию -35)")
    ap.add_argument("--min-pause", type=float, default=0.4, help="минимальная пауза для вырезания, с")
    ap.add_argument("--pad", type=float, default=0.08, help="запас вокруг речи, с")
    ap.add_argument("--min-keep", type=float, default=0.15, help="куски речи короче этого выбрасываем, с")
    ap.add_argument("--json", help="сохранить список оставленных отрезков")
    ap.add_argument("--selftest", action="store_true", help="проверить скрипт на сгенерированном ролике")
    a = ap.parse_args()
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        raise SystemExit("Нужны ffmpeg и ffprobe в PATH.")
    if a.selftest:
        return selftest()
    if not a.input or not a.output:
        ap.error("укажите input и output")
    rep = cut(a.input, a.output, a.noise, a.min_pause, a.pad, a.min_keep, a.json)
    print(f"Готово: {rep['duration_in']} с → {rep['duration_out']} с, вырезано {rep['removed']} с пауз, кусков: {len(rep['segments'])}")


if __name__ == "__main__":
    main()
