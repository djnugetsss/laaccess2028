import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme';

type Props = {
  children?: ReactNode;
  /** Adds a barely-there pastel wash at the top of the screen. */
  wash?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Soft off-white → white canvas used behind every screen. */
export function GradientBackground({ children, wash = true, style }: Props) {
  return (
    <View style={[styles.fill, style]}>
      <LinearGradient
        colors={colors.background.gradient}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {wash && (
        <>
          <LinearGradient
            colors={['rgba(220,235,250,0.55)', 'rgba(220,235,250,0)']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0.3, y: 0.6 }}
            style={styles.wash}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['rgba(251,227,234,0.45)', 'rgba(251,227,234,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.6, y: 0.5 }}
            style={styles.wash}
            pointerEvents="none"
          />
        </>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  wash: { position: 'absolute', top: 0, left: 0, right: 0, height: 420 },
});
