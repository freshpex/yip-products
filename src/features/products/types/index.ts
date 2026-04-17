export interface Product {
  id: string;
  name: string;
  price: number;
  imageUris: string[];
  createdAt: number;
  updatedAt: number;
}

export type ProductFormData = {
  name: string;
  price: string;
  imageUris: string[];
};
