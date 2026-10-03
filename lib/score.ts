import type { SignalLevel } from '@/theme';

export { SCORE_MAX } from './scoreEngine';

export type ScoreBand = SignalLevel; // 'high' | 'medium' | 'low'

/** Thresholds for ring color bands. */
export const SCORE_BANDS = { high: 80, medium: 60 } as const;

export function scoreBand(score: number): ScoreBand {
  if (score >= SCORE_BANDS.high) return 'high';
  if (score >= SCORE_BANDS.medium) return 'medium';
  return 'low';
}

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}
