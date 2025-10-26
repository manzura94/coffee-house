export interface CartItem {
  id: number;
  name: string;
  size: string;
  extras: string[];
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  quantity: number;
}
