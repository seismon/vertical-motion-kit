import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, FACE, H, W} from '../theme';

/**
 * Фон ролика. В продукте здесь видео говорящего: передайте videoSrc (файл из public/).
 * Без видео рисуем спокойный тёмный фон с мягким светом там, где обычно лицо.
 */
export const Background: React.FC<{videoSrc?: string}> = ({videoSrc}) => {
  const frame = useCurrentFrame();
  if (videoSrc) {
    return (
      <AbsoluteFill>
        <OffthreadVideo src={staticFile(videoSrc)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)'}} />
      </AbsoluteFill>
    );
  }
  const t = frame / 30;
  const bx = 50 + Math.sin(t * 0.6) * 6;
  const by = 34 + Math.cos(t * 0.5) * 3;
  const cx = FACE.x * W + (FACE.w * W) / 2;
  const cy = FACE.y * H + (FACE.h * H) / 2;
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(80% 42% at ${bx}% ${by}%, rgba(139,124,255,0.26) 0%, rgba(139,124,255,0) 72%),
            radial-gradient(55% 30% at ${100 - bx}% 82%, rgba(200,255,61,0.16) 0%, rgba(200,255,61,0) 70%),
            linear-gradient(180deg, #11131B 0%, #0B0D12 60%, #08090D 100%)`,
        }}
      />
      {/* мягкий свет сверху и виньетка: так overlay-элементы читаются, как поверх настоящего видео */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 45% at ${cx / W * 100}% ${cy / H * 100 - 6}%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 70%),
            radial-gradient(120% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: interpolate(frame % 2, [0, 1], [0.05, 0.06]),
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)',
        }}
      />
    </AbsoluteFill>
  );
};
