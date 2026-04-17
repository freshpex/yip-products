import { create } from 'zustand';
import { Product } from '../../features/products/types';
import { MAX_PRODUCTS } from '../../constants';
import { loadProducts, saveProducts } from '../../features/products/services/storage';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
}

// Derived selectors — keep outside the store to avoid stale closures
export const selectProducts = (s: ProductState) => s.products;
export const selectCanAddProduct = (s: ProductState) => s.products.length < MAX_PRODUCTS;
export const selectIsLoading = (s: ProductState) => s.isLoading;
export const selectError = (s: ProductState) => s.error;
export const selectIsInitialized = (s: ProductState) => s.isInitialized;

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true, error: null });
    try {
      const products = await loadProducts();
      set({ products, isLoading: false, isInitialized: true });
    } catch {
      set({
        isLoading: false,
        error: 'Failed to load products. Please restart the app.',
        isInitialized: true,
      });
    }
  },

  addProduct: async (productData) => {
    const { products } = get();
    if (products.length >= MAX_PRODUCTS) return false;

    const now = Date.now();
    const newProduct: Product = {
      ...productData,
      id: `${now}-${Math.random().toString(36).substring(2, 11)}`,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [...products, newProduct];
    set({ products: updated });

    try {
      await saveProducts(updated);
      return true;
    } catch {
      set({ products });
      return false;
    }
  },

  updateProduct: async (id, updates) => {
    const { products } = get();
    if (!products.some((p) => p.id === id)) return false;

    const updated = products.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
    );
    set({ products: updated });

    try {
      await saveProducts(updated);
      return true;
    } catch {
      set({ products });
      return false;
    }
  },

  deleteProduct: async (id) => {
    const { products } = get();
    const updated = products.filter((p) => p.id !== id);
    set({ products: updated });

    try {
      await saveProducts(updated);
      return true;
    } catch {
      set({ products });
      return false;
    }
  },

}));
