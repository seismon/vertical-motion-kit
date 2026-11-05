import React from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';

// Таймер-кольцо: обратный отсчёт с ускорением, последние секунды — красным с пульсом.
export const TIMER_FROM = 15;
export const TIMER_RUN: [number, number] = [14, 92];

export const timerValue = (frame: number) => {
  const p = interpolate(frame, TIMER_RUN, [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  return {p, n: Math.ceil(TIMER_FROM * (1 - p))};
};

export const Timer: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 14, stiffness: 150}});
  const {p, n} = timerValue(frame);
  const R = 190;
  const L = 2 * Math.PI * R;
  const hot = interpolate(p, [0.7, 0.85], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ring = interpolateColors(hot, [0, 1], [C.lime, C.coral]);
  const pulse = n <= 3 && n > 0 ? 1 + 0.06 * Math.max(0, Math.sin(((frame % 15) / 15) * Math.PI)) : 1;
  const done = spring({frame: frame - TIMER_RUN[1], fps, config: {damping: 10, stiffness: 200}});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 300}}>
      <div style={{position: 'relative', width: 480, height: 480, transform: `scale(${(0.5 + 0.5 * enter) * pulse})`, opacity: enter}}>
        <svg width="480" height="480" viewBox="0 0 480 480" style={{position: 'absolute', inset: 0}}>
          <circle cx="240" cy="240" r={R} fill="rgba(18,20,28,0.6)" stroke="rgba(255,255,255,0.12)" strokeWidth="26" />
          <circle
            cx="240"
            cy="240"
            r={R}
            fill="none"
            stroke={ring}
            strokeWidth="26"
            strokeLinecap="round"
            strokeDasharray={L}
            strokeDashoffset={L * p}
            transform="rotate(-90 240 240)"
            style={{filter: `drop-shadow(0 0 18px ${ring})`}}
          />
        </svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{font: `800 170px/1 ${F.display}`, color: C.white, fontVariantNumeric: 'tabular-nums', transform: `scale(${1 + 0.12 * done * (n === 0 ? 1 : 0)})`}}>{n}</div>
          <div style={{font: `700 36px ${F.body}`, color: C.soft, marginTop: 8}}>секунд</div>
        </div>
      </div>
      <div style={{marginTop: 46, font: `800 58px/1.2 ${F.display}`, color: C.white, opacity: enter, textAlign: 'center'}}>
        15 секунд на хук
      </div>
    </AbsoluteFill>
  );
};
