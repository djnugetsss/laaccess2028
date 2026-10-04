import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getDirections } from './mapboxApi';
import { DEMO_DRIVING_FALLBACK, DEMO_TRANSIT_ROUTES, DESTINATION, ORIGIN } from './mockRoutes';
import { buildRealRoute, matchesTrip, type TravelProfile } from './realRoutes';
import { useTrip } from './trip';
import type { MappedRoute } from './types';

type RouteSetState = {
  /** Every route for the current trip: real (Mapbox), demo transit, or labeled fallback. */
  routes: MappedRoute[];
  /** True while real driving/walking directions are loading. */
  loading: boolean;
  /** Demo transit only exists for the Granada Hills → Valley Zone trip. */
  isDemoTrip: boolean;
  /** Real profiles that failed with no fallback to show. */
  failed: TravelProfile[];
  retry: () => void;
  getRoute: (id: string | undefined) => MappedRoute | undefined;
};

const RouteSetContext = createContext<RouteSetState | null>(null);

const PROFILES: TravelProfile[] = ['driving', 'walking'];

/**
 * Builds the route set for the current trip. Real driving + walking come from Mapbox
 * Directions; demo transit is added only on the demo trip. If a real request fails, the demo
 * trip falls back to its labeled mock driving route; other trips just report the failure.
 */
export function RouteSetProvider({ children }: { children: ReactNode }) {
  const { fromPlace, toPlace } = useTrip();
  const [routes, setRoutes] = useState<MappedRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState<TravelProfile[]>([]);
  const [attempt, setAttempt] = useState(0);

  const isDemoTrip =
    !!fromPlace &&
    !!toPlace &&
    matchesTrip(fromPlace, toPlace, ORIGIN.coordinate, DESTINATION.coordinate);

  const fromKey = fromPlace?.coordinate.join(',') ?? '';
  const toKey = toPlace?.coordinate.join(',') ?? '';

  useEffect(() => {
    if (!fromPlace || !toPlace) {
      setRoutes([]);
      setFailed([]);
      setLoading(false);
      return;
    }

    const base = isDemoTrip ? DEMO_TRANSIT_ROUTES : [];
    setRoutes(base);
    setFailed([]);
    setLoading(true);

    const controller = new AbortController();
    Promise.allSettled(
      PROFILES.map((p) =>
        getDirections(p, fromPlace.coordinate, toPlace.coordinate, controller.signal),
      ),
    ).then((results) => {
      if (controller.signal.aborted) return;
      const next = [...base];
      const missing: TravelProfile[] = [];
      results.forEach((res, i) => {
        if (res.status === 'fulfilled') {
          next.push(buildRealRoute(res.value, { venueTrip: isDemoTrip }));
        } else if (PROFILES[i] === 'driving' && isDemoTrip) {
          next.push(DEMO_DRIVING_FALLBACK);
        } else {
          missing.push(PROFILES[i]);
        }
      });
      setRoutes(next);
      setFailed(missing);
      setLoading(false);
    });

    return () => controller.abort();
    // Coordinates (as keys) drive refetching; place objects change identity on every pick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromKey, toKey, isDemoTrip, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const value = useMemo<RouteSetState>(
    () => ({
      routes,
      loading,
      isDemoTrip,
      failed,
      retry,
      getRoute: (id) => routes.find((r) => r.id === id),
    }),
    [routes, loading, isDemoTrip, failed, retry],
  );

  return <RouteSetContext value={value}>{children}</RouteSetContext>;
}

export function useRouteSet(): RouteSetState {
  const ctx = use(RouteSetContext);
  if (!ctx) throw new Error('useRouteSet must be used inside <RouteSetProvider>');
  return ctx;
}
