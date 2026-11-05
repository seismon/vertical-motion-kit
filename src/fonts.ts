import {continueRender, delayRender, staticFile} from 'remotion';

// Шрифты лежат в public/fonts (OFL), поэтому рендер не зависит от интернета.
const faces: Array<[string, string, number]> = [
  ['Unbounded', 'unbounded', 700],
  ['Unbounded', 'unbounded', 800],
  ['Manrope', 'manrope', 500],
  ['Manrope', 'manrope', 700],
  ['Manrope', 'manrope', 800],
];

let started = false;

export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Загружаю шрифты');
  const all = faces.flatMap(([family, file, weight]) =>
    (['cyrillic', 'latin'] as const).map((subset) => {
      const range = subset === 'cyrillic' ? 'U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116' : 'U+0000-00FF, U+2000-206F, U+2190-21FF, U+2212';
      const face = new FontFace(family, `url(${staticFile(`fonts/${file}-${subset}-${weight}.woff2`)}) format('woff2')`, {
        weight: String(weight),
        unicodeRange: range,
      });
      document.fonts.add(face);
      return face.load();
    }),
  );
  Promise.all(all)
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
};
