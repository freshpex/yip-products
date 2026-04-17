import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  showCharCount?: boolean;
}

export function Input({ label, error, style, showCharCount, maxLength, value, ...props }: InputProps) {
  return (
    <View style={styles.container} accessible={false}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {showCharCount && maxLength != null && (
          <Text style={[styles.charCount, value && value.length > maxLength * 0.9 && styles.charCountWarn]}>
            {(value ?? '').length}/{maxLength}
          </Text>
        )}
      </View>
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.textTertiary}
        accessibilityLabel={label}
        accessibilityHint={error || undefined}
        maxLength={maxLength}
        value={value}
        {...props}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.label,
  },
  charCount: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  charCountWarn: {
    color: colors.warning,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
