import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../app/navigation/types';
import { useProductStore, selectProducts } from '../../../app/store/useProductStore';
import { useProductForm } from '../hooks/useProductForm';
import { Screen, Input, Button } from '../../../components/common';
import { ImagePickerButton } from '../../../components/product';
import { spacing } from '../../../theme';
import { PRODUCT_NAME_MAX } from '../../../constants';

type FormRoute = RouteProp<RootStackParamList, 'ProductForm'>;

export function ProductFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<FormRoute>();
  const productId = route.params?.productId;

  const products = useProductStore(selectProducts);
  const existingProduct = useMemo(
    () => (productId ? products.find((p) => p.id === productId) : undefined),
    [productId, products]
  );

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const {
    form,
    errors,
    isSubmitting,
    isEditing,
    isDirty,
    setField,
    pickImage,
    removeImage,
    handleSubmit,
  } = useProductForm({
    existingProduct,
    onSuccess: goBack,
  });

  // Warn on unsaved changes when navigating back
  const confirmDiscard = useCallback(() => {
    if (!isDirty) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      'Discard Changes?',
      'You have unsaved changes. Are you sure you want to go back?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  }, [isDirty, navigation]);

  // Intercept back navigation (header, gesture, and hardware back)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!isDirty) return;
      e.preventDefault();
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });
    return unsubscribe;
  }, [navigation, isDirty]);

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Input
            label="Product Name"
            placeholder="e.g. Wireless Headphones"
            value={form.name}
            onChangeText={(text) => setField('name', text)}
            error={errors.name}
            maxLength={PRODUCT_NAME_MAX}
            showCharCount
            autoFocus={!isEditing}
            returnKeyType="next"
          />

          <Input
            label="Price ($)"
            placeholder="e.g. 29.99"
            value={form.price}
            onChangeText={(text) => setField('price', text)}
            error={errors.price}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />

          <ImagePickerButton
            imageUri={form.imageUri}
            onPickImage={pickImage}
            onRemoveImage={removeImage}
          />

          <Button
            title={isEditing ? 'Save Changes' : 'Add Product'}
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          />

          <Button
            title="Cancel"
            onPress={confirmDiscard}
            variant="secondary"
            style={styles.cancelButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  cancelButton: {
    marginTop: spacing.md,
  },
});
