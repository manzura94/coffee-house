export interface Additive {
  name: string;
}

export interface CartItem {
  id: string | number;
  name: string;
  imageUrl: string;
  size?: { name: string };
  additives?: Additive[];
  totalPrice?: number;
  quantity: number;
  discountedTotal?: number
}

export interface CartItems {
  id: number;
  name: string;
  imageUrl: string | null;
  size: { name: string; price: number };
  additives: { name: string; price: number }[];
  totalPrice: number;
  quantity: number;
  isDiscounted: boolean;
}

export interface Additives {
  name: string;
  price: string | number;
  discountPrice?: string | number;
}

export interface Size {
  size: string;
  price: string;
  discountPrice?: string;
}
