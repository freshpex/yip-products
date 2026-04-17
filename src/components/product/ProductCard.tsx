import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Product } from '../../features/products/types';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onDelete: () => void;
  onImagePress?: () => void;
}

export const ProductCard = React.memo(function ProductCard({
  product,
  onPress,
  onDelete,
  onImagePress,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const firstImage = product.imageUris?.[0];
  const imageCount = product.imageUris?.length ?? 0;
  const showImage = !!firstImage && !imageError;

  const formattedPrice = product.price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View style={styles.card}>
      {/* Image area — tap opens gallery if images exist */}
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={imageCount > 0 && onImagePress ? onImagePress : onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={
          imageCount > 0
            ? `${imageCount} photo${imageCount > 1 ? 's' : ''} for ${product.name}. Tap to view.`
            : product.name
        }
      >
        {showImage ? (
          <Image
            source={{ uri: firstImage }}
            style={styles.image}
            onError={() => setImageError(true)}
            accessibilityLabel={`Photo of ${product.name}`}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon} accessibilityElementsHidden>📷</Text>
          </View>
        )}
        {imageCount > 1 && (
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>📷 {imageCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Info area — tap to edit */}
      <TouchableOpacity
        style={styles.info}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, $${formattedPrice}. Tap to edit`}
      >
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.price}>${formattedPrice}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={onDelete}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${product.name}`}
      >
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
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
    position: 'relative',
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
  imageBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  imageBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  info: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    alignSelf: 'stretch',
    justifyContent: 'center',
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

