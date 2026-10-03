type Scale = Record<string, string>;
type Signal = { solid: string; soft: string; text: string; ring: [string, string] };

declare const palette: {
  white: string;
  canvas: { top: string; mid: string; bottom: string };
  navy: Scale;
  coral: Scale;
  pink: Scale;
  green: Scale;
  blue: Scale;
  signal: { high: Signal; medium: Signal; low: Signal };
};

export = palette;
