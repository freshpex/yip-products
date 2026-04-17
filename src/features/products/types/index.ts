export interface Product {
  id: string;
  name: string;
  price: number;
  imageUri: string | null;
  createdAt: number;
  updatedAt: number;
}

export type ProductFormData = {
  name: string;
  price: string;
  imageUri: string | null;
};
