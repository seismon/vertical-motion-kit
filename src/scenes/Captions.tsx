import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';

// Субтитры по словам, как после распознавания речи (Whisper/ElevenLabs отдают слова с таймингами).
export type Word = {text: string; start: number; end: number}; // в кадрах

const PHRASE = 'Сегодня покажу три приёма которые держат зрителя до конца ролика';

// Демо-тайминги: равномерный темп речи. В продукте сюда приходят тайминги из распознавания.
export const demoWords = (startFrame = 6, perWord = 11): Word[] =>
  PHRASE.split(' ').map((text, i) => ({text, start: startFrame + i * perWord, end: startFrame + (i + 1) * perWord}));

// Делим на «страницы» по 3 слова: столько комфортно читать на вертикальном экране.
const pages = (words: Word[], size = 3) => {
  const out: Word[][] = [];
  for (let i = 0; i < words.length; i += size) out.push(words.slice(i, i + size));
  return out;
};

export const Captions: React.FC<{words?: Word[]}> = ({words = demoWords()}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const all = pages(words);
  const page = all.find((p) => frame >= p[0].start && frame < p[p.length - 1].end) ?? (frame < all[0][0].start ? null : all[all.length - 1]);
  if (!page) return null;
  const enter = spring({frame: frame - page[0].start, fps, config: {damping: 15, stiffness: 220}});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 420}}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px 18px',
          maxWidth: 940,
          transform: `scale(${0.85 + 0.15 * enter})`,
          opacity: enter,
        }}
      >
        {page.map((w) => {
          const active = frame >= w.start && frame < w.end;
          const spoken = frame >= w.end;
          const pop = spring({frame: frame - w.start, fps, config: {damping: 12, stiffness: 260}});
          const bg = active ? interpolate(pop, [0, 1], [0, 1]) : 0;
          return (
            <span
              key={w.start}
              style={{
                position: 'relative',
                padding: '6px 22px 12px',
                borderRadius: 22,
                background: `rgba(200,255,61,${bg})`,
                color: active ? C.ink : spoken ? C.white : 'rgba(255,255,255,0.45)',
                font: `800 92px/1.15 ${F.body}`,
                letterSpacing: -1,
                textTransform: 'uppercase',
                transform: `scale(${active ? 1 + 0.08 * pop : 1})`,
                textShadow: active ? 'none' : '0 6px 24px rgba(0,0,0,0.55)',
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
