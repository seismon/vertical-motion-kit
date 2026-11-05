import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {Background} from './components/Background';
import {loadFonts} from './fonts';
import {SCENES, SHOWREEL_FRAMES, Showreel} from './Showreel';
import {FPS, H, W} from './theme';

loadFonts();

// Каждая сцена отдельно — удобно править в Remotion Studio.
const Solo: React.FC<{scene: string}> = ({scene}) => {
  const C = SCENES.find((s) => s.id === scene)?.C;
  return (
    <AbsoluteFill>
      <Background />
      {C ? <C /> : null}
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <>
    <Composition
      id="Showreel"
      component={Showreel}
      durationInFrames={SHOWREEL_FRAMES}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{videoSrc: ''}}
    />
    {SCENES.map((s) => (
      <Composition
        key={s.id}
        id={`Scene-${s.id}`}
        component={Solo}
        durationInFrames={s.d}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{scene: s.id}}
      />
    ))}
  </>
);
