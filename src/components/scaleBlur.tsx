import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';

// Свой переход: старая сцена уходит с увеличением и размытием, затем новая проявляется из размытия.
// Сцены не показываются одновременно, поэтому тексты не накладываются друг на друга.
type Props = Record<string, never>;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const ScaleBlur: React.FC<TransitionPresentationComponentProps<Props>> = ({children, presentationDirection, presentationProgress: p}) => {
  const entering = presentationDirection === 'entering';
  const style: React.CSSProperties = entering
    ? {
        opacity: interpolate(p, [0.45, 1], [0, 1], clamp),
        transform: `scale(${interpolate(p, [0.45, 1], [0.9, 1], clamp)})`,
        filter: `blur(${interpolate(p, [0.45, 1], [18, 0], clamp)}px)`,
      }
    : {
        opacity: interpolate(p, [0, 0.5], [1, 0], clamp),
        transform: `scale(${interpolate(p, [0, 0.5], [1, 1.1], clamp)})`,
        filter: `blur(${interpolate(p, [0, 0.5], [0, 18], clamp)}px)`,
      };
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

export const scaleBlur = (): TransitionPresentation<Props> => ({component: ScaleBlur, props: {}});
