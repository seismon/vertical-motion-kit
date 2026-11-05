import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';

const CHIPS = ['Remotion', 'React', 'TypeScript', 'ffmpeg'];

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame, fps, config: {damping: 14, stiffness: 150}});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', padding: '0 84px 300px'}}>
      <div style={{font: `800 92px/1.05 ${F.display}`, color: C.white, letterSpacing: -2, transform: `translateY(${(1 - t) * 60}px)`, opacity: t}}>
        vertical
        <br />
        <span style={{color: C.lime}}>motion</span> kit
      </div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 44}}>
        {CHIPS.map((c, i) => {
          const s = spring({frame: frame - 10 - i * 4, fps, config: {damping: 14, stiffness: 200}});
          return (
            <span
              key={c}
              style={{
                padding: '14px 28px',
                borderRadius: 999,
                border: `2px solid ${C.glassLine}`,
                background: 'rgba(255,255,255,0.07)',
                font: `700 36px ${F.body}`,
                color: C.white,
                transform: `scale(${s})`,
              }}
            >
              {c}
            </span>
          );
        })}
      </div>
      <div style={{marginTop: 40, font: `600 40px ${F.body}`, color: C.soft, opacity: spring({frame: frame - 26, fps})}}>Исходный код — на GitHub</div>
    </AbsoluteFill>
  );
};
