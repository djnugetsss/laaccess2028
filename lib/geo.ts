import type { LngLat } from './types';

export type Bounds = { ne: LngLat; sw: LngLat };

export function boundsOf(points: readonly LngLat[]): Bounds {
  const lngs = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  return {
    ne: [Math.max(...lngs), Math.max(...lats)],
    sw: [Math.min(...lngs), Math.min(...lats)],
  };
}

/**
 * Simple equirectangular projection of `bounds` into a box, preserving aspect ratio.
 * Good enough for schematic fallbacks at city scale — not for anything navigational.
 */
export function makeProjector(
  bounds: Bounds,
  box: { width: number; height: number; padX: number; padTop: number; padBottom: number },
) {
  const { ne, sw } = bounds;
  const availW = Math.max(1, box.width - box.padX * 2);
  const availH = Math.max(1, box.height - box.padTop - box.padBottom);
  const latScale = Math.cos(((ne[1] + sw[1]) / 2) * (Math.PI / 180));
  const spanX = Math.max(1e-6, (ne[0] - sw[0]) * latScale);
  const spanY = Math.max(1e-6, ne[1] - sw[1]);
  const k = Math.min(availW / spanX, availH / spanY);
  const offX = box.padX + (availW - spanX * k) / 2;
  const offY = box.padTop + (availH - spanY * k) / 2;
  return ([lng, lat]: LngLat): [number, number] => [
    offX + (lng - sw[0]) * latScale * k,
    offY + (ne[1] - lat) * k,
  ];
}
