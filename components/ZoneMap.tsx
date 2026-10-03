import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { boundsOf, makeProjector } from '@/lib/geo';
import type { VenueZone } from '@/lib/la28Zones';
import { mapbox, mapUnavailableReason, type MapboxModule, type MapUnavailableReason } from '@/lib/mapbox';
import { colors, radii, shadows } from '@/theme';

import { GradientBackground } from './GradientBackground';
import { MapLoadingOverlay, MapStatusCard } from './MapStatus';
import { Text } from './Text';

type Props = {
  zones: VenueZone[];
  selectedId: string;
  onSelect: (id: string) => void;
  height?: number;
};

/** Rounded map card of illustrative venue zones. Mapbox when available, schematic otherwise. */
export function ZoneMap({ height = 280, ...props }: Props) {
  const [failed, setFailed] = useState(false);
  return (
    <View
      style={[
        {
          height,
          borderRadius: radii['2xl'],
          borderCurve: 'continuous',
          overflow: 'hidden',
          borderWidth: 0.5,
          borderColor: colors.border.hairline,
          backgroundColor: colors.background.surface,
        },
        shadows.md,
      ]}
    >
      {mapbox && !failed ? (
        <MapboxZones mb={mapbox} onError={() => setFailed(true)} {...props} />
      ) : (
        <SchematicZones {...props} reason={failed ? 'loadError' : (mapUnavailableReason ?? 'noToken')} />
      )}
    </View>
  );
}

function ZonePin({ zone, selected, onPress }: { zone: VenueZone; selected: boolean; onPress: () => void }) {
  const strong = selected || zone.highlighted;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${zone.name}${zone.highlighted ? ', demo destination' : ''}. Illustrative location.`}
      onPress={onPress}
      hitSlop={10}
      style={{ alignItems: 'center' }}
    >
      <View
        style={[
          {
            width: strong ? 22 : 16,
            height: strong ? 22 : 16,
            borderRadius: 11,
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
          },
          shadows.sm,
        ]}
      >
        <View
          style={{
            width: strong ? 14 : 9,
            height: strong ? 14 : 9,
            borderRadius: 7,
            backgroundColor: zone.highlighted ? colors.palette.coral[500] : colors.palette.navy[selected ? 900 : 400],
          }}
        />
      </View>
      {(strong || selected) && (
        <View
          style={[
            {
              marginTop: 3,
              paddingHorizontal: 7,
              paddingVertical: 2,
              borderRadius: radii.full,
              backgroundColor: 'rgba(255,255,255,0.95)',
            },
            shadows.sm,
          ]}
        >
          <Text variant="caption" maxFontSizeMultiplier={1.2} style={{ fontSize: 11, lineHeight: 14 }}>
            {zone.name}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function MapboxZones({ mb, zones, selectedId, onSelect, onError }: Props & { mb: MapboxModule; onError: () => void }) {
  const { MapView, Camera, MarkerView, StyleURL } = mb;
  const [loaded, setLoaded] = useState(false);
  const bounds = useMemo(
    () => ({ ...boundsOf(zones.map((z) => z.coordinate)), paddingTop: 50, paddingBottom: 40, paddingLeft: 40, paddingRight: 40 }),
    [zones],
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
        onDidFinishLoadingMap={() => setLoaded(true)}
        onMapLoadingError={onError}
        accessibilityLabel="Map of illustrative venue zones across Los Angeles"
      >
        <Camera bounds={bounds} animationDuration={0} />
        {zones.map((z) => (
          <MarkerView key={z.id} coordinate={z.coordinate} anchor={{ x: 0.5, y: 0.2 }} allowOverlap>
            <ZonePin zone={z} selected={z.id === selectedId} onPress={() => onSelect(z.id)} />
          </MarkerView>
        ))}
      </MapView>
      {!loaded && <MapLoadingOverlay />}
    </View>
  );
}

/** Schematic: faint coastline curve + projected zone pins. Clearly a diagram, not a map. */
function SchematicZones({ zones, selectedId, onSelect, reason }: Props & { reason: MapUnavailableReason }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const project = useMemo(
    () =>
      makeProjector(boundsOf(zones.map((z) => z.coordinate)), {
        width: size.w,
        height: size.h,
        padX: 56,
        padTop: 36,
        padBottom: 96,
      }),
    [zones, size],
  );

  return (
    <GradientBackground style={StyleSheet.absoluteFill}>
      <View
        style={StyleSheet.absoluteFill}
        onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      >
        {size.w > 0 && (
          <>
            <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill} pointerEvents="none">
              {/* soft stylized "coast" along the lower-left — decorative */}
              <Path
                d={`M0 ${size.h * 0.62} C ${size.w * 0.25} ${size.h * 0.7}, ${size.w * 0.35} ${size.h * 0.9}, ${size.w * 0.55} ${size.h}`}
                stroke={colors.palette.blue[300]}
                strokeWidth={3}
                strokeDasharray="2 8"
                strokeLinecap="round"
                fill="none"
              />
              {zones
                .filter((z) => z.highlighted)
                .map((z) => {
                  const [x, y] = project(z.coordinate);
                  return <Circle key={z.id} cx={x} cy={y} r={30} fill={colors.palette.coral[500]} opacity={0.12} />;
                })}
            </Svg>
            {zones.map((z) => {
              const [x, y] = project(z.coordinate);
              return (
                <View key={z.id} style={{ position: 'absolute', left: x - 60, top: y - 11, width: 120, alignItems: 'center' }}>
                  <ZonePin zone={z} selected={z.id === selectedId} onPress={() => onSelect(z.id)} />
                </View>
              );
            })}
          </>
        )}
      </View>
      <MapStatusCard reason={reason} bottom={12} />
    </GradientBackground>
  );
}
