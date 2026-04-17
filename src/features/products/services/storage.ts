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
    Array.isArray(obj.imageUris) &&
    (obj.imageUris as unknown[]).every((u) => typeof u === 'string') &&
    typeof obj.createdAt === 'number' &&
    typeof obj.updatedAt === 'number'
  );
}

function migrateProduct(value: unknown): Product | null {
  if (typeof value !== 'object' || value === null) return null;
  const obj = value as Record<string, unknown>;

  if (isValidProduct(obj)) return obj as unknown as Product;
  if (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.price === 'number' &&
    Number.isFinite(obj.price) &&
    typeof obj.createdAt === 'number' &&
    typeof obj.updatedAt === 'number'
  ) {
    const imageUris: string[] = typeof obj.imageUri === 'string' ? [obj.imageUri] : [];
    return {
      id: obj.id,
      name: obj.name,
      price: obj.price,
      imageUris,
      createdAt: obj.createdAt as number,
      updatedAt: obj.updatedAt as number,
    };
  }

  return null;
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

  return parsed.map(migrateProduct).filter((p): p is Product => p !== null);
}

export async function saveProducts(products: Product[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}
