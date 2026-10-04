import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { boundsOf, makeProjector } from '@/lib/geo';
import {
  mapbox,
  mapUnavailableReason,
  type MapboxModule,
  type MapUnavailableReason,
} from '@/lib/mapbox';
import type { LngLat, MappedRoute } from '@/lib/types';
import { colors, radii, shadows } from '@/theme';

import { GradientBackground } from './GradientBackground';
import { MapLoadingOverlay, MapStatusCard } from './MapStatus';
import { Text } from './Text';

type Endpoint = { label: string; coordinate: LngLat };

type Props = {
  routes: MappedRoute[];
  selectedId: string;
  origin: Endpoint;
  destination: Endpoint;
  onSelectRoute?: (id: string) => void;
  /** Space covered by overlays, so the camera frames routes in the visible area. */
  insets?: { top: number; bottom: number };
};

/** Map with every route faint and the selected one drawn in coral. Falls back gracefully. */
export function RouteMap(props: Props) {
  const [failed, setFailed] = useState(false);
  if (mapbox && !failed)
    return <MapboxRouteMap mb={mapbox} onError={() => setFailed(true)} {...props} />;
  return (
    <SchematicRouteMap
      {...props}
      reason={failed ? 'loadError' : (mapUnavailableReason ?? 'noToken')}
    />
  );
}

// ───────────────────────────── Mapbox ─────────────────────────────

function MapboxRouteMap({
  mb,
  routes,
  selectedId,
  origin,
  destination,
  onSelectRoute,
  onError,
  insets = { top: 0, bottom: 0 },
}: Props & { mb: MapboxModule; onError: () => void }) {
  const { MapView, Camera, ShapeSource, LineLayer, MarkerView, StyleURL } = mb;
  const [loaded, setLoaded] = useState(false);
  const selected: MappedRoute | undefined = routes.find((r) => r.id === selectedId) ?? routes[0];

  // Endpoints are always part of the frame, so the map is never empty while routes load or fail.
  const bounds = useMemo(
    () => ({
      ...boundsOf([
        origin.coordinate,
        destination.coordinate,
        ...routes.flatMap((r) => r.geometry),
      ]),
      paddingTop: insets.top + 24,
      paddingBottom: insets.bottom + 36,
      paddingLeft: 44,
      paddingRight: 44,
    }),
    [routes, origin.coordinate, destination.coordinate, insets.top, insets.bottom],
  );

  const others = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: routes
        .filter((r) => r.id !== selected?.id)
        .map((r) => ({
          type: 'Feature',
          properties: { id: r.id },
          geometry: { type: 'LineString', coordinates: r.geometry },
        })),
    }),
    [routes, selected?.id],
  );

  const active = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: selected
        ? [
            {
              type: 'Feature',
              properties: { id: selected.id },
              geometry: { type: 'LineString', coordinates: selected.geometry },
            },
          ]
        : [],
    }),
    [selected],
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        style={StyleSheet.absoluteFill}
        styleURL={StyleURL.Light}
        scaleBarEnabled={false}
        compassEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        logoPosition={{ bottom: insets.bottom + 6, left: 14 }}
        attributionPosition={{ bottom: insets.bottom + 6, right: 14 }}
        onDidFinishLoadingMap={() => setLoaded(true)}
        onMapLoadingError={onError}
        accessibilityLabel={`Map showing ${selected ? `${selected.label} route` : 'trip'} from ${origin.label} to ${destination.label}`}
      >
        <Camera bounds={bounds} animationDuration={loaded ? 600 : 0} />

        {/* Two sources mounted once in a fixed order so the selected line always draws on top. */}
        <ShapeSource
          id="routes-others"
          shape={others}
          hitbox={{ width: 24, height: 24 }}
          onPress={(e) => {
            const id = e.features[0]?.properties?.id;
            if (typeof id === 'string') onSelectRoute?.(id);
          }}
        >
          <LineLayer
            id="routes-others-line"
            style={{
              lineColor: colors.palette.navy[400],
              lineOpacity: 0.45,
              lineWidth: 4,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </ShapeSource>

        <ShapeSource id="route-selected" shape={active}>
          <LineLayer
            id="route-selected-casing"
            style={{ lineColor: '#FFFFFF', lineWidth: 10, lineCap: 'round', lineJoin: 'round' }}
          />
          <LineLayer
            id="route-selected-line"
            aboveLayerID="route-selected-casing"
            style={{
              lineColor: colors.palette.coral[500],
              lineWidth: 5.5,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </ShapeSource>

        {/* anchor ≈ center of the dot (label sits below it) */}
        <MarkerView coordinate={origin.coordinate} anchor={{ x: 0.5, y: 0.23 }} allowOverlap>
          <EndpointMarker kind="origin" label={origin.label} />
        </MarkerView>
        <MarkerView coordinate={destination.coordinate} anchor={{ x: 0.5, y: 0.26 }} allowOverlap>
          <EndpointMarker kind="destination" label={destination.label} />
        </MarkerView>
      </MapView>
      {!loaded && <MapLoadingOverlay />}
    </View>
  );
}

export function EndpointMarker({ kind, label }: { kind: 'origin' | 'destination'; label: string }) {
  const isDest = kind === 'destination';
  return (
    <View
      style={{ alignItems: 'center' }}
      accessibilityLabel={`${isDest ? 'Destination' : 'Start'}: ${label}`}
    >
      <View
        style={[
          {
            width: isDest ? 26 : 20,
            height: isDest ? 26 : 20,
            borderRadius: 13,
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
          },
          shadows.sm,
        ]}
      >
        <View
          style={{
            width: isDest ? 16 : 11,
            height: isDest ? 16 : 11,
            borderRadius: 8,
            backgroundColor: isDest ? colors.palette.coral[500] : colors.palette.navy[900],
          }}
        />
      </View>
      <View
        style={[
          {
            marginTop: 4,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: radii.full,
            backgroundColor: 'rgba(255,255,255,0.95)',
          },
          shadows.sm,
        ]}
      >
        <Text
          variant="caption"
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
          style={{ fontSize: 11, lineHeight: 14 }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

// ───────────────────────────── Schematic fallback ─────────────────────────────

/** Draws the mock route geometry schematically so route selection stays visible without a map. */
function SchematicRouteMap({
  routes,
  selectedId,
  origin,
  destination,
  reason,
  insets = { top: 0, bottom: 0 },
}: Props & { reason: MapUnavailableReason }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const selected: MappedRoute | undefined = routes.find((r) => r.id === selectedId) ?? routes[0];

  const project = useMemo(
    () =>
      makeProjector(
        boundsOf([origin.coordinate, destination.coordinate, ...routes.flatMap((r) => r.geometry)]),
        {
          width: size.w,
          height: size.h,
          padX: 44,
          padTop: insets.top + 40,
          padBottom: insets.bottom + 90,
        },
      ),
    [routes, origin.coordinate, destination.coordinate, size, insets.top, insets.bottom],
  );

  const points = (r: MappedRoute) => r.geometry.map((p) => project(p).join(',')).join(' ');
  const [ox, oy] = project(origin.coordinate);
  const [dx, dy] = project(destination.coordinate);

  return (
    <GradientBackground style={StyleSheet.absoluteFill}>
      <View
        style={StyleSheet.absoluteFill}
        accessible
        accessibilityLabel={`Schematic of ${selected ? `${selected.label} route` : 'trip'} from ${origin.label} to ${destination.label}`}
        onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      >
        {size.w > 0 && (
          <Svg width={size.w} height={size.h}>
            {routes
              .filter((r) => r.id !== selected?.id)
              .map((r) => (
                <Polyline
                  key={r.id}
                  points={points(r)}
                  stroke={colors.palette.navy[300]}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))}
            {selected && (
              <>
                <Polyline
                  points={points(selected)}
                  stroke="#FFFFFF"
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <Polyline
                  points={points(selected)}
                  stroke={colors.palette.coral[500]}
                  strokeWidth={5.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </>
            )}
            <Circle cx={ox} cy={oy} r={9} fill="#FFFFFF" />
            <Circle cx={ox} cy={oy} r={5.5} fill={colors.palette.navy[900]} />
            <Circle cx={dx} cy={dy} r={12} fill="#FFFFFF" />
            <Circle cx={dx} cy={dy} r={8} fill={colors.palette.coral[500]} />
          </Svg>
        )}
      </View>
      <MapStatusCard reason={reason} bottom={insets.bottom + 12} />
    </GradientBackground>
  );
}
