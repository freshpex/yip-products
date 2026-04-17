import { useState, useCallback, useRef, useMemo } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Product, ProductFormData } from '../types';
import { validateProductForm } from '../utils/validation';
import { useProductStore } from '../../../app/store/useProductStore';

interface UseProductFormOptions {
  existingProduct?: Product;
  onSuccess: () => void;
}

export function useProductForm({ existingProduct, onSuccess }: UseProductFormOptions) {
  const isEditing = !!existingProduct;
  const addProduct = useProductStore((s) => s.addProduct);
  const updateProduct = useProductStore((s) => s.updateProduct);

  // Stable ref for onSuccess so handleSubmit never gets a stale closure
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const initialForm = useMemo<ProductFormData>(
    () => ({
      name: existingProduct?.name ?? '',
      price: existingProduct ? String(existingProduct.price) : '',
      imageUri: existingProduct?.imageUri ?? null,
    }),
    [existingProduct]
  );

  const [form, setForm] = useState<ProductFormData>(initialForm);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);
  const submittedRef = useRef(false);

  // Track whether the form has been modified
  const isDirty =
    form.name !== initialForm.name ||
    form.price !== initialForm.price ||
    form.imageUri !== initialForm.imageUri;

  const setField = useCallback(
    <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        if (prev[field]) {
          const next = { ...prev };
          delete next[field];
          return next;
        }
        return prev;
      });
    },
    []
  );

  const pickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to add product images.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setField('imageUri', result.assets[0].uri);
    }
  }, [setField]);

  const removeImage = useCallback(() => {
    setField('imageUri', null);
  }, [setField]);

  const handleSubmit = useCallback(async () => {
    if (submitLockRef.current) return;

    const validation = validateProductForm(form.name, form.price);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      const productData = {
        name: form.name.trim(),
        price: parseFloat(form.price.replace(/,/g, '').trim()),
        imageUri: form.imageUri,
      };

      let success: boolean;
      if (isEditing && existingProduct) {
        success = await updateProduct(existingProduct.id, productData);
      } else {
        success = await addProduct(productData);
      }

      if (success) {
        submittedRef.current = true;
        onSuccessRef.current();
      } else {
        Alert.alert(
          'Error',
          isEditing
            ? 'Failed to update product.'
            : 'Failed to add product. The limit may have been reached.'
        );
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  }, [form, isEditing, existingProduct, addProduct, updateProduct]);

  return {
    form,
    errors,
    isSubmitting,
    isEditing,
    isDirty,
    submittedRef,
    setField,
    pickImage,
    removeImage,
    handleSubmit,
  };
}
