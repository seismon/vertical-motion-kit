import React from 'react';
import {C} from '../theme';

// Стеклянная карточка: размытие фона, тонкая светлая рамка, мягкая тень.
export const Glass: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div
    style={{
      background: C.glass,
      border: `2px solid ${C.glassLine}`,
      borderRadius: 44,
      boxShadow: '0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
      backdropFilter: 'blur(28px) saturate(140%)',
      WebkitBackdropFilter: 'blur(28px) saturate(140%)',
      ...style,
    }}
  >
    {children}
  </div>
);
