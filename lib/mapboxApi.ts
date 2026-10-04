import { env, hasMapsKey } from './env';
import type { DirectionsResult, TravelProfile } from './realRoutes';
import type { LngLat, Place } from './types';

/**
 * Thin clients for the Mapbox Geocoding v6 and Directions v5 REST APIs.
 * Uses the public token from env (never hard-coded). Every call times out and can be
 * aborted; failures throw a MapboxApiError so callers can show a clean message.
 */

export type MapboxErrorKind = 'noToken' | 'network' | 'noResults' | 'http';

export class MapboxApiError extends Error {
  constructor(
    public kind: MapboxErrorKind,
    message: string,
  ) {
    super(message);
  }
}

const TIMEOUT_MS = 10_000;

/** Bias search toward the San Fernando Valley, limited to greater Los Angeles. */
const PROXIMITY: LngLat = [-118.45, 34.2];
const LA_BBOX = [-119.2, 33.6, -117.6, 34.9].join(',');

async function getJson(url: string, signal?: AbortSignal): Promise<any> {
  if (!hasMapsKey) throw new MapboxApiError('noToken', 'Mapbox token missing');

  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), TIMEOUT_MS);
  const onAbort = () => timeout.abort();
  signal?.addEventListener('abort', onAbort);

  try {
    const res = await fetch(`${url}&access_token=${encodeURIComponent(env.mapsApiKey)}`, {
      signal: timeout.signal,
    });
    if (!res.ok) throw new MapboxApiError('http', `Mapbox responded ${res.status}`);
    return await res.json();
  } catch (e) {
    if (e instanceof MapboxApiError) throw e;
    // Caller-initiated aborts propagate as-is so they can be ignored.
    if (signal?.aborted) throw e;
    throw new MapboxApiError('network', 'Network request failed');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

// ───────────────────────────── geocoding ─────────────────────────────

const stripCountry = (s: string) => s.replace(/,\s*United States$/, '');

/** Forward geocode with autocomplete. Returns [] for blank queries. */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const q = query.trim();
  if (!q) return [];

  const url =
    'https://api.mapbox.com/search/geocode/v6/forward' +
    `?q=${encodeURIComponent(q)}` +
    `&proximity=${PROXIMITY.join(',')}` +
    `&bbox=${LA_BBOX}` +
    '&country=us&language=en&autocomplete=true&limit=5';

  const data = await getJson(url, signal);
  const features: any[] = Array.isArray(data?.features) ? data.features : [];

  return features
    .filter((f) => Array.isArray(f?.geometry?.coordinates))
    .map((f) => {
      const p = f.properties ?? {};
      const name: string = p.name ?? q;
      return {
        name,
        address: stripCountry(
          p.full_address ?? [name, p.place_formatted].filter(Boolean).join(', '),
        ),
        coordinate: [f.geometry.coordinates[0], f.geometry.coordinates[1]] as LngLat,
      };
    });
}

// ───────────────────────────── directions ─────────────────────────────

/** `driving-traffic` gives times with current traffic; walking uses pedestrian paths. */
const PROFILE_PATH: Record<TravelProfile, string> = {
  driving: 'mapbox/driving-traffic',
  walking: 'mapbox/walking',
};

export async function getDirections(
  profile: TravelProfile,
  from: LngLat,
  to: LngLat,
  signal?: AbortSignal,
): Promise<DirectionsResult> {
  const coords = `${from.join(',')};${to.join(',')}`;
  const url =
    `https://api.mapbox.com/directions/v5/${PROFILE_PATH[profile]}/${coords}` +
    '?geometries=geojson&overview=full&alternatives=false';

  const data = await getJson(url, signal);
  const route = data?.routes?.[0];
  const geometry: LngLat[] | undefined = route?.geometry?.coordinates;

  if (data?.code !== 'Ok' || !route || !geometry || geometry.length < 2) {
    throw new MapboxApiError('noResults', data?.message ?? 'No route found');
  }

  return {
    profile,
    durationSec: route.duration,
    distanceM: route.distance,
    geometry,
    summary: route.legs?.[0]?.summary ?? '',
  };
}
