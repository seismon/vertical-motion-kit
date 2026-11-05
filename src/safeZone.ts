import {FACE, H, W} from './theme';

export type Box = {x: number; y: number; w: number; h: number};

export const faceBox = (): Box => ({x: FACE.x * W, y: FACE.y * H, w: FACE.w * W, h: FACE.h * H});

export const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const inFrame = (b: Box) => b.x >= 24 && b.y >= 24 && b.x + b.w <= W - 24 && b.y + b.h <= H - 24;

/**
 * Выносит элемент из зоны лица по кратчайшему пути (вверх, вниз, влево, вправо) с отступом gap.
 * Не ставит его поверх уже размещённых элементов (taken) и не выпускает за кадр.
 * Если элемент и так не мешает — возвращает его как есть.
 */
export const avoidFace = (box: Box, taken: Box[] = [], gap = 32): Box => {
  const f = faceBox();
  const busy = (b: Box) => overlaps(b, f) || taken.some((t) => overlaps(b, {x: t.x - gap / 2, y: t.y - gap / 2, w: t.w + gap, h: t.h + gap}));
  if (!busy(box)) return box;
  const dirs: Array<[number, number, Box]> = [
    [0, -1, {...box, y: f.y - box.h - gap}],
    [0, 1, {...box, y: f.y + f.h + gap}],
    [-1, 0, {...box, x: f.x - box.w - gap}],
    [1, 0, {...box, x: f.x + f.w + gap}],
  ];
  const options: Box[] = [];
  for (const [dx, dy, start] of dirs) {
    let b = start;
    // занято соседом — отходим дальше в ту же сторону
    for (let k = 0; k < 8 && busy(b) && inFrame(b); k++) b = {...b, x: b.x + dx * (b.w + gap) * 0.5, y: b.y + dy * (b.h + gap) * 0.5};
    if (inFrame(b) && !busy(b)) options.push(b);
  }
  if (!options.length) return {...box, y: f.y + f.h + gap};
  const dist = (b: Box) => Math.abs(b.x - box.x) + Math.abs(b.y - box.y);
  return options.sort((a, b) => dist(a) - dist(b))[0];
};

/** Раскладывает несколько элементов по очереди: каждый следующий учитывает уже поставленные. */
export const placeAll = (boxes: Box[], gap = 32): Box[] =>
  boxes.reduce<Box[]>((done, b) => [...done, avoidFace(b, done, gap)], []);
