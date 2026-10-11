export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  unit: string;
  price: number;
  imageUrl: string | null;
  available: boolean;
  stockQuantity: number | null;
}

export interface ProductPayload {
  sku: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  imageUrl: string;
  available: boolean;
  stockQuantity: number | null;
}
