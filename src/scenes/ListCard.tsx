import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Glass} from '../components/Glass';
import {Kicker} from '../components/Kicker';
import {C, F} from '../theme';

export const LIST_ITEMS = ['Хук в первые 2 секунды', 'Субтитры по словам', 'Смена плана каждые 3–5 с'];
export const LIST_FIRST = 22;
export const LIST_STEP = 16;

const Check: React.FC<{progress: number}> = ({progress}) => (
  <svg width="52" height="52" viewBox="0 0 52 52">
    <circle cx="26" cy="26" r="24" fill={C.lime} opacity={progress > 0 ? 1 : 0.15} />
    <path
      d="M15 27 L23 35 L38 18"
      fill="none"
      stroke={C.ink}
      strokeWidth="5.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="40"
      strokeDashoffset={40 * (1 - progress)}
    />
  </svg>
);

export const ListCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const card = spring({frame, fps, config: {damping: 16, stiffness: 140}});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', padding: '0 64px 250px'}}>
      <Glass style={{padding: '52px 56px 40px', transform: `translateY(${(1 - card) * 260}px) scale(${0.94 + 0.06 * card})`, opacity: card}}>
        <Kicker text="Чек-лист" delay={4} color={C.violet} />
        <div style={{font: `800 64px/1.15 ${F.display}`, color: C.white, margin: '30px 0 26px', letterSpacing: -1}}>3 приёма удержания</div>
        {LIST_ITEMS.map((t, i) => {
          const d = LIST_FIRST + i * LIST_STEP;
          const s = spring({frame: frame - d, fps, config: {damping: 14, stiffness: 170}});
          const chk = interpolate(frame - d - 6, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
          return (
            <div
              key={t}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                padding: '24px 0',
                borderTop: i ? `2px solid ${C.glassLine}` : 'none',
                transform: `translateX(${(1 - s) * -80}px)`,
                opacity: s,
              }}
            >
              <Check progress={chk} />
              <span style={{font: `700 50px/1.2 ${F.body}`, color: C.white}}>{t}</span>
            </div>
          );
        })}
      </Glass>
    </AbsoluteFill>
  );
};
