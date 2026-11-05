import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Kicker} from '../components/Kicker';
import {C, F} from '../theme';

// Заголовок-хук: слова выезжают снизу на пружине, ключевое слово подчёркивает маркер.
const Word: React.FC<{children: string; delay: number; color?: string; marker?: boolean}> = ({children, delay, color = C.white, marker}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 13, stiffness: 160, mass: 0.9}});
  const blur = interpolate(s, [0, 1], [14, 0]);
  const m = interpolate(frame - delay - 8, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <div style={{position: 'relative', display: 'inline-block', overflow: 'visible'}}>
      {marker ? (
        <div
          style={{
            position: 'absolute',
            left: -18,
            right: -18,
            top: '18%',
            bottom: '6%',
            background: C.lime,
            borderRadius: 18,
            transform: `scaleX(${m}) skewX(-6deg)`,
            transformOrigin: 'left center',
          }}
        />
      ) : null}
      <span
        style={{
          position: 'relative',
          display: 'inline-block',
          color: marker && m > 0.5 ? C.ink : color,
          font: `800 112px/1.06 ${F.display}`,
          letterSpacing: -2,
          transform: `translateY(${(1 - s) * 120}px) rotate(${(1 - s) * 6}deg)`,
          opacity: Math.min(1, s * 1.4),
          filter: `blur(${blur}px)`,
        }}
      >
        {children}
      </span>
    </div>
  );
};

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const sub = interpolate(frame, [34, 52], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{padding: '0 84px', justifyContent: 'flex-end', paddingBottom: 300}}>
      <div style={{marginBottom: 40}}>
        <Kicker text="Совет №1" />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start'}}>
        <Word delay={4}>Монтаж</Word>
        <Word delay={10}>без</Word>
        <Word delay={16} marker>
          монтажёра
        </Word>
      </div>
      <div
        style={{
          marginTop: 44,
          font: `600 46px/1.35 ${F.body}`,
          color: C.soft,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 20}px)`,
        }}
      >
        Сырое видео с телефона → готовый ролик
      </div>
    </AbsoluteFill>
  );
};
