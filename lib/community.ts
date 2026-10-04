import type { AccentTone } from '@/theme';

import type { LngLat } from './types';

export type Valley = 'San Fernando Valley' | 'Santa Clarita Valley' | 'Antelope Valley';

export type CommunityArea = {
  id: string;
  name: string;
  valley: Valley;
  /** General, non-statistical context. No invented figures. */
  note: string;
  /** Area center from Mapbox geocoding (demo origin uses the demo trip's start point). */
  coordinate: LngLat;
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
    coordinate: [-118.5016, 34.2658],
    isDemoOrigin: true,
  },
  {
    id: 'porter-ranch',
    name: 'Porter Ranch',
    valley: 'San Fernando Valley',
    note: 'Foothill neighborhoods where hills and distance shape walking routes.',
    coordinate: [-118.5619, 34.2823],
  },
  {
    id: 'santa-clarita',
    name: 'Santa Clarita',
    valley: 'Santa Clarita Valley',
    note: 'Served by Metrolink’s Antelope Valley Line toward Los Angeles.',
    coordinate: [-118.536, 34.4285],
  },
  {
    id: 'palmdale',
    name: 'Palmdale',
    valley: 'Antelope Valley',
    note: 'Long regional trips where transfers and reliability matter most.',
    coordinate: [-118.1166, 34.5795],
  },
  {
    id: 'lancaster',
    name: 'Lancaster',
    valley: 'Antelope Valley',
    note: 'Northern end of the Metrolink Antelope Valley Line.',
    coordinate: [-118.142, 34.6979],
  },
];
