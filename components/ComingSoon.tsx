import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { screenPadding, spacing } from '@/theme';

import { BackButton } from './BackButton';
import { Card } from './Card';
import { Disclaimer } from './Disclaimer';
import { GradientBackground } from './GradientBackground';
import { ScreenHeader } from './ScreenHeader';
import { Text } from './Text';

type Props = { title: string; subtitle: string; children?: ReactNode };

/** Shared scaffold for routes that exist in navigation but aren't built yet. */
export function ComingSoon({ title, subtitle, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.sm,
          paddingBottom: insets.bottom + spacing['2xl'],
          paddingHorizontal: screenPadding,
          gap: spacing.lg,
        }}
      >
        <BackButton />
        <ScreenHeader title={title} subtitle={subtitle} />
        {children ?? (
          <Card variant="tinted" tone="blue" padding="lg">
            <Text variant="subheading">Coming soon</Text>
            <Text variant="callout" tone="secondary">
              This section is part of a later build of the prototype.
            </Text>
          </Card>
        )}
        <View style={{ flex: 1 }} />
        <Disclaimer />
      </ScrollView>
    </GradientBackground>
  );
}
