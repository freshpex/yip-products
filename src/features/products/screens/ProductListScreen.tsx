import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/types';
import { useProductStore, selectProducts, selectCanAddProduct } from '../../../app/store/useProductStore';
import { Screen, Button, EmptyState } from '../../../components/common';
import { ProductCard, ProductCounter } from '../../../components/product';
import { Product } from '../types';
import { spacing } from '../../../theme';
import { MAX_PRODUCTS } from '../../../constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductList'>;

export function ProductListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const products = useProductStore(selectProducts);
  const canAdd = useProductStore(selectCanAddProduct);
  const deleteProduct = useProductStore((s) => s.deleteProduct);

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
      />
    ),
    [handleEditProduct, handleDeleteProduct]
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
});
