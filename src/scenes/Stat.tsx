import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Glass} from '../components/Glass';
import {C, F} from '../theme';

// Счётчик с ростом и столбики. Цифры — пример для демонстрации анимации, не статистика.
const BARS = [28, 41, 63, 100];

export const Stat: React.FC<{value?: number}> = ({value = 247}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const card = spring({frame, fps, config: {damping: 16, stiffness: 140}});
  const count = interpolate(frame, [10, 62], [0, value], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', padding: '0 64px 250px'}}>
      <Glass style={{padding: '50px 56px 46px', transform: `translateY(${(1 - card) * 220}px)`, opacity: card}}>
        <div style={{font: `700 40px ${F.body}`, color: C.soft}}>Охват роликов, пример</div>
        <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 18}}>
          <div style={{font: `800 168px/1 ${F.display}`, color: C.lime, letterSpacing: -4, fontVariantNumeric: 'tabular-nums'}}>
            +{Math.round(count)}%
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 26, height: 300, marginTop: 40}}>
          {BARS.map((b, i) => {
            const g = spring({frame: frame - 16 - i * 7, fps, config: {damping: 15, stiffness: 120}});
            const last = i === BARS.length - 1;
            return (
              <div key={i} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, height: '100%', justifyContent: 'flex-end'}}>
                <div
                  style={{
                    width: '100%',
                    height: `${b * g}%`,
                    borderRadius: 22,
                    background: last ? C.lime : 'rgba(255,255,255,0.18)',
                    boxShadow: last ? `0 0 40px rgba(200,255,61,0.45)` : 'none',
                  }}
                />
                <div style={{font: `700 30px ${F.body}`, color: last ? C.white : C.quiet}}>Нед {i + 1}</div>
              </div>
            );
          })}
        </div>
      </Glass>
    </AbsoluteFill>
  );
};
