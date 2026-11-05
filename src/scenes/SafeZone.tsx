import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Box, faceBox, placeAll} from '../safeZone';
import {C, F} from '../theme';

// Наглядно: элементы, которые «хотели» встать на лицо, сами уходят из зоны лица.
const STICKERS: Array<{text: string; box: Box; color: string}> = [
  {text: 'ВАЖНО', box: {x: 300, y: 420, w: 300, h: 110}, color: C.coral},
  {text: '3 ошибки', box: {x: 470, y: 700, w: 380, h: 110}, color: C.violet},
  {text: '+ субтитры', box: {x: 240, y: 900, w: 420, h: 110}, color: C.lime},
];
const TARGETS = placeAll(STICKERS.map((s) => s.box));

export const SafeZone: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = faceBox();
  const zone = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});
  const title = spring({frame: frame - 40, fps, config: {damping: 15, stiffness: 160}});
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: f.x,
          top: f.y,
          width: f.w,
          height: f.h,
          borderRadius: 60,
          border: `5px dashed rgba(255,255,255,${0.55 * zone})`,
          background: `rgba(255,255,255,${0.04 * zone})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{font: `700 40px ${F.body}`, color: `rgba(255,255,255,${0.7 * zone})`}}>зона лица</span>
      </div>
      {STICKERS.map((st, i) => {
        const to = TARGETS[i];
        const appear = spring({frame: frame - 6 - i * 6, fps, config: {damping: 14, stiffness: 200}});
        const move = spring({frame: frame - 22 - i * 5, fps, config: {damping: 12, stiffness: 120}});
        const x = st.box.x + (to.x - st.box.x) * move;
        const y = st.box.y + (to.y - st.box.y) * move;
        return (
          <div
            key={st.text}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: st.box.w,
              height: st.box.h,
              borderRadius: 28,
              background: st.color,
              color: C.ink,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              font: `800 46px ${F.display}`,
              transform: `scale(${appear}) rotate(${(1 - move) * -4}deg)`,
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            }}
          >
            {st.text}
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: 84,
          right: 84,
          bottom: 260,
          font: `800 76px/1.12 ${F.display}`,
          color: C.white,
          opacity: title,
          transform: `translateY(${(1 - title) * 40}px)`,
        }}
      >
        Ничего не закрывает лицо
      </div>
    </AbsoluteFill>
  );
};
