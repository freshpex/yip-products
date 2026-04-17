import React, { useCallback, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/types';
import { useProductStore, selectProducts, selectCanAddProduct } from '../../../app/store/useProductStore';
import { Screen, Button, EmptyState } from '../../../components/common';
import { ProductCard, ProductCounter } from '../../../components/product';
import { Product } from '../types';
import { colors, spacing } from '../../../theme';
import { MAX_PRODUCTS } from '../../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductList'>;

export function ProductListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const products = useProductStore(selectProducts);
  const canAdd = useProductStore(selectCanAddProduct);
  const deleteProduct = useProductStore((s) => s.deleteProduct);

  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const openGallery = useCallback((images: string[]) => {
    if (images.length === 0) return;
    setGalleryImages(images);
    setGalleryIndex(0);
    setGalleryVisible(true);
  }, []);

  const closeGallery = useCallback(() => setGalleryVisible(false), []);

  const handleAddProduct = useCallback(() => {
    if (!canAdd) {
      Alert.alert(
        'Limit Reached',
        `You can only add up to ${MAX_PRODUCTS} products. Please delete an existing product to add a new one.`,
        [{ text: 'OK' }]
      );
      return;
    }
    navigation.navigate('ProductForm', {});
  }, [navigation, canAdd]);

  const handleEditProduct = useCallback(
    (productId: string) => {
      navigation.navigate('ProductForm', { productId });
    },
    [navigation]
  );

  const handleDeleteProduct = useCallback(
    (product: Product) => {
      Alert.alert(
        'Delete Product',
        `Are you sure you want to delete "${product.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const success = await deleteProduct(product.id);
              if (!success) {
                Alert.alert('Error', 'Failed to delete product. Please try again.');
              }
            },
          },
        ]
      );
    },
    [deleteProduct]
  );

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        product={item}
        onPress={() => handleEditProduct(item.id)}
        onDelete={() => handleDeleteProduct(item)}
        onImagePress={() => openGallery(item.imageUris)}
      />
    ),
    [handleEditProduct, handleDeleteProduct, openGallery]
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  return (
    <Screen>
      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            title="No Products Yet"
            subtitle="Start by adding your first product. You can add up to 5 products with a name, price, and optional photo."
          />
          <View style={styles.emptyAction}>
            <Button title="Add Your First Product" onPress={handleAddProduct} />
          </View>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={<ProductCounter count={products.length} />}
          ListFooterComponent={
            <View style={styles.footer}>
              <Button
                title="Add Product"
                onPress={handleAddProduct}
                disabled={!canAdd}
                style={styles.addButton}
              />
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Image gallery modal */}
      <Modal
        visible={galleryVisible}
        transparent
        animationType="fade"
        onRequestClose={closeGallery}
        statusBarTranslucent
      >
        <View style={styles.galleryBackdrop}>
          <SafeAreaView style={styles.galleryContainer}>
            <TouchableOpacity
              style={styles.galleryClose}
              onPress={closeGallery}
              accessibilityRole="button"
              accessibilityLabel="Close gallery"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.galleryCloseText}>✕</Text>
            </TouchableOpacity>
            <FlatList
              data={galleryImages}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(uri, i) => `${uri}-${i}`}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setGalleryIndex(idx);
              }}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={styles.galleryImage}
                  resizeMode="contain"
                  accessibilityLabel="Product photo"
                />
              )}
            />
            {galleryImages.length > 1 && (
              <View style={styles.dots}>
                {galleryImages.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === galleryIndex && styles.dotActive]}
                  />
                ))}
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
  },
  emptyAction: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  listContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  addButton: {
    marginTop: spacing.sm,
  },
  // Gallery modal
  galleryBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
  },
  galleryContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  galleryClose: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryCloseText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '700',
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    backgroundColor: colors.surface,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
