import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Product } from '../../features/products/types';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onDelete: () => void;
}

export const ProductCard = React.memo(function ProductCard({
  product,
  onPress,
  onDelete,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = !!product.imageUri && !imageError;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, $${product.price.toFixed(2)}. Tap to edit`}
    >
      <View style={styles.imageContainer}>
        {showImage ? (
          <Image
            source={{ uri: product.imageUri! }}
            style={styles.image}
            onError={() => setImageError(true)}
            accessibilityLabel={`Photo of ${product.name}`}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon} accessibilityElementsHidden>📷</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={onDelete}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${product.name}`}
      >
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    ...shadows.medium,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    alignItems: 'center',
  },
  imageContainer: {
    width: 80,
    height: 80,
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: colors.imagePlaceholder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  name: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  price: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  deleteButton: {
    padding: spacing.md,
    marginRight: spacing.sm,
  },
  deleteText: {
    fontSize: 18,
    color: colors.textTertiary,
    fontWeight: '600',
  },
});
