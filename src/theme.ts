// Единая палитра и типографика: все сцены берут цвета и шрифты отсюда.
export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const C = {
  ink: '#0B0D12',
  white: '#FFFFFF',
  soft: 'rgba(255,255,255,0.72)',
  quiet: 'rgba(255,255,255,0.5)',
  lime: '#C8FF3D',
  violet: '#8B7CFF',
  coral: '#FF6B5B',
  glass: 'rgba(18,20,28,0.58)',
  glassLine: 'rgba(255,255,255,0.14)',
};

export const F = {
  display: 'Unbounded, system-ui, sans-serif',
  body: 'Manrope, system-ui, sans-serif',
};

// Зона лица говорящего (доли кадра 1080×1920). На вертикальном видео с телефона лицо почти всегда здесь.
// Ни одна анимация не заходит внутрь — см. src/safeZone.ts.
export const FACE = {x: 0.17, y: 0.15, w: 0.66, h: 0.4};
