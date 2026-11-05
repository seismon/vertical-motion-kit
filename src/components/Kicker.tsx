import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';

// Маленькая плашка над заголовком («Совет №1», «Чек-лист»).
export const Kicker: React.FC<{text: string; delay?: number; color?: string}> = ({text, delay = 0, color = C.lime}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 14, stiffness: 180}});
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 26px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.08)',
        border: `2px solid ${C.glassLine}`,
        color: C.white,
        font: `700 34px ${F.body}`,
        letterSpacing: 1,
        transform: `scale(${0.6 + 0.4 * s}) translateY(${(1 - s) * 30}px)`,
        opacity: s,
      }}
    >
      <span style={{width: 16, height: 16, borderRadius: 99, background: color, boxShadow: `0 0 24px ${color}`}} />
      {text}
    </div>
  );
};
