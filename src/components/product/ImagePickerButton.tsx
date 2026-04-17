import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface ImagePickerButtonProps {
  imageUri: string | null;
  onPickImage: () => void;
  onRemoveImage: () => void;
}

export function ImagePickerButton({
  imageUri,
  onPickImage,
  onRemoveImage,
}: ImagePickerButtonProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Product Photo (optional)</Text>
      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.preview} />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={onPickImage} accessibilityLabel="Change photo">
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onRemoveImage} accessibilityLabel="Remove photo">
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.picker}
          onPress={onPickImage}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Select a product photo"
        >
          <Text style={styles.pickerIcon}>📷</Text>
          <Text style={styles.pickerText}>Tap to select a photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  picker: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.imagePlaceholder,
  },
  pickerIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  pickerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  previewContainer: {
    alignItems: 'center',
  },
  preview: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  changeText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  removeText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '600',
  },
});
