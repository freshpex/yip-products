import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MAX_PRODUCTS } from '../../constants';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface ProductCounterProps {
  count: number;
}

export function ProductCounter({ count }: ProductCounterProps) {
  const isAtLimit = count >= MAX_PRODUCTS;

  return (
    <View
      style={[styles.container, isAtLimit && styles.atLimit]}
      accessibilityRole="text"
      accessibilityLabel={`${count} of ${MAX_PRODUCTS} products${isAtLimit ? '. Product limit reached' : ''}`}
    >
      <Text style={[styles.text, isAtLimit && styles.atLimitText]}>
        {count} / {MAX_PRODUCTS} products
      </Text>
      {isAtLimit && (
        <Text style={styles.limitMessage}>Product limit reached</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  atLimit: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warning,
  },
  text: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  atLimitText: {
    color: colors.warning,
  },
  limitMessage: {
    ...typography.caption,
    color: colors.warning,
    marginTop: 2,
  },
});
