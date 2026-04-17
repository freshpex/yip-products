import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { MAX_PRODUCT_IMAGES } from '../../constants';

interface ImagePickerButtonProps {
  imageUris: string[];
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// 4 slots, 3 gaps of spacing.sm (8), padding spacing.lg (16) each side
const SLOT_SIZE = Math.floor((SCREEN_WIDTH - spacing.lg * 2 - spacing.sm * 3) / 4);

export function ImagePickerButton({ imageUris, onAddImage, onRemoveImage }: ImagePickerButtonProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Product Photos (optional) · {imageUris.length}/{MAX_PRODUCT_IMAGES}
      </Text>
      <View style={styles.grid}>
        {Array.from({ length: MAX_PRODUCT_IMAGES }, (_, i) => {
          const uri = imageUris[i];
          const isAddSlot = i === imageUris.length;

          if (uri) {
            // Filled slot — image + remove button
            return (
              <View key={i} style={[styles.slot, { width: SLOT_SIZE, height: SLOT_SIZE }]}>
                <Image source={{ uri }} style={styles.slotImage} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => onRemoveImage(i)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove photo ${i + 1}`}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          }

          if (isAddSlot) {
            // Next available slot, add button
            return (
              <TouchableOpacity
                key={i}
                style={[styles.addSlot, { width: SLOT_SIZE, height: SLOT_SIZE }]}
                onPress={onAddImage}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={i === 0 ? 'Select a product photo' : `Add photo ${i + 1}`}
              >
                <Text style={styles.cloudIcon}>☁</Text>
                <Text style={styles.plusIcon}>+</Text>
                <Text style={styles.addLabel}>{i === 0 ? 'Add' : 'More'}</Text>
              </TouchableOpacity>
            );
          }

          // Remaining slots — decorative empty
          return (
            <View key={i} style={[styles.emptySlot, { width: SLOT_SIZE, height: SLOT_SIZE }]}>
              <Text style={styles.emptyIcon}>☁</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  slot: {
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  slotImage: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  addSlot: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
  },
  cloudIcon: {
    fontSize: 20,
    color: colors.primary,
    lineHeight: 24,
  },
  plusIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 18,
    marginTop: -2,
  },
  addLabel: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 10,
    marginTop: 1,
  },
  emptySlot: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.imagePlaceholder,
    opacity: 0.45,
  },
  emptyIcon: {
    fontSize: 20,
    color: colors.textTertiary,
  },
});

