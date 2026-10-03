import type { AccentTone } from '@/theme';

export type Valley = 'San Fernando Valley' | 'Santa Clarita Valley' | 'Antelope Valley';

export type CommunityArea = {
  id: string;
  name: string;
  valley: Valley;
  /** General, non-statistical context. No invented figures. */
  note: string;
  isDemoOrigin?: boolean;
};

export const VALLEY_TONES: Record<Valley, AccentTone> = {
  'San Fernando Valley': 'pink',
  'Santa Clarita Valley': 'green',
  'Antelope Valley': 'blue',
};

export const COMMUNITY_AREAS: CommunityArea[] = [
  {
    id: 'granada-hills',
    name: 'Granada Hills',
    valley: 'San Fernando Valley',
    note: 'Starting point for the demo trip to the Valley Zone.',
    isDemoOrigin: true,
  },
  {
    id: 'porter-ranch',
    name: 'Porter Ranch',
    valley: 'San Fernando Valley',
    note: 'Foothill neighborhoods where hills and distance shape walking routes.',
  },
  {
    id: 'santa-clarita',
    name: 'Santa Clarita',
    valley: 'Santa Clarita Valley',
    note: 'Served by Metrolink’s Antelope Valley Line toward Los Angeles.',
  },
  {
    id: 'palmdale',
    name: 'Palmdale',
    valley: 'Antelope Valley',
    note: 'Long regional trips where transfers and reliability matter most.',
  },
  {
    id: 'lancaster',
    name: 'Lancaster',
    valley: 'Antelope Valley',
    note: 'Northern end of the Metrolink Antelope Valley Line.',
  },
];
