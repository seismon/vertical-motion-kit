import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {TransitionSeries, linearTiming, springTiming} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {scaleBlur} from './components/scaleBlur';
import {Background} from './components/Background';
import {loadFonts} from './fonts';
import {Captions} from './scenes/Captions';
import {Hook} from './scenes/Hook';
import {LIST_FIRST, LIST_ITEMS, LIST_STEP, ListCard} from './scenes/ListCard';
import {Outro} from './scenes/Outro';
import {SafeZone} from './scenes/SafeZone';
import {Stat} from './scenes/Stat';
import {TIMER_RUN, Timer, timerValue} from './scenes/Timer';

loadFonts();

const T = 14; // длина перехода, кадров

export const SCENES = [
  {id: 'hook', d: 110, C: Hook},
  {id: 'captions', d: 132, C: Captions},
  {id: 'list', d: 120, C: ListCard},
  {id: 'timer', d: 112, C: Timer},
  {id: 'stat', d: 110, C: Stat},
  {id: 'safe', d: 104, C: SafeZone},
  {id: 'outro', d: 92, C: Outro},
] as const;

// Где каждая сцена начинается на общей шкале (переходы перекрывают соседние сцены на T кадров).
const starts = SCENES.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].d - T], []);
export const SHOWREEL_FRAMES = starts[starts.length - 1] + SCENES[SCENES.length - 1].d;
const at = (id: (typeof SCENES)[number]['id']) => starts[SCENES.findIndex((s) => s.id === id)];

// Только переходы, где две сцены не видны поверх друг друга: сдвиг и свой «зум с размытием».
const presentations = [
  slide({direction: 'from-bottom'}),
  scaleBlur(),
  slide({direction: 'from-right'}),
  scaleBlur(),
  slide({direction: 'from-bottom'}),
  scaleBlur(),
];

// Звуки: свист на каждом переходе, «поп» на пунктах списка, тиканье на последних секундах таймера.
const timerTicks = (() => {
  const out: number[] = [];
  let prev = Infinity;
  for (let f = TIMER_RUN[0]; f <= TIMER_RUN[1]; f++) {
    const {n} = timerValue(f);
    if (n < prev && n <= 5) out.push(f);
    prev = n;
  }
  return out;
})();

const Sfx: React.FC<{from: number; src: string; volume?: number}> = ({from, src, volume = 0.6}) => (
  <Sequence from={from} durationInFrames={45} layout="none">
    <Audio src={staticFile(`sfx/${src}`)} volume={volume} />
  </Sequence>
);

export const Showreel: React.FC<{videoSrc?: string}> = ({videoSrc}) => (
  <AbsoluteFill>
    <Background videoSrc={videoSrc || undefined} />
    <TransitionSeries>
      {SCENES.map((s, i) => (
        <React.Fragment key={s.id}>
          <TransitionSeries.Sequence durationInFrames={s.d}>
            <s.C />
          </TransitionSeries.Sequence>
          {i < SCENES.length - 1 ? (
            <TransitionSeries.Transition
              presentation={presentations[i] as ReturnType<typeof slide>}
              timing={i % 2 ? linearTiming({durationInFrames: T}) : springTiming({durationInFrames: T, config: {damping: 200}})}
            />
          ) : null}
        </React.Fragment>
      ))}
    </TransitionSeries>
    {starts.slice(1).map((s) => (
      <Sfx key={s} from={Math.max(0, s - 4)} src="whoosh.wav" volume={0.45} />
    ))}
    {LIST_ITEMS.map((_, i) => (
      <Sfx key={i} from={at('list') + LIST_FIRST + i * LIST_STEP} src="pop.wav" volume={0.7} />
    ))}
    {timerTicks.map((f) => (
      <Sfx key={f} from={at('timer') + f} src="tick.wav" volume={0.8} />
    ))}
    <Sfx from={at('stat') - 26} src="riser.wav" volume={0.5} />
  </AbsoluteFill>
);
