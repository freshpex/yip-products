import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types';
import { STORAGE_KEY } from '../../../constants';

function isValidProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.price === 'number' &&
    Number.isFinite(obj.price) &&
    (obj.imageUri === null || typeof obj.imageUri === 'string') &&
    typeof obj.createdAt === 'number' &&
    typeof obj.updatedAt === 'number'
  );
}

export async function loadProducts(): Promise<Product[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  // Filter out any corrupted entries rather than crashing
  return parsed.filter(isValidProduct);
}

export async function saveProducts(products: Product[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}
