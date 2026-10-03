import { View } from 'react-native';

import { layout } from '@/theme';

import { Text } from './Text';

/** Title + optional caption above a group of cards. Sits one `stack` step above its content. */
export function SectionHeader({ title, caption }: { title: string; caption?: string }) {
  return (
    <View style={{ gap: 2, marginBottom: layout.stack }}>
      <Text variant="subheading" accessibilityRole="header">
        {title}
      </Text>
      {caption ? (
        <Text variant="caption" tone="secondary">
          {caption}
        </Text>
      ) : null}
    </View>
  );
}
