export type BackendProduct = {
  id: number;
  name: string;
  description: string;
  price: string;
  discountPrice?: string;
  category: string;
  sizes: Record<
    string,
    { size: string; price: string; discountPrice?: string }
  >;
  additives: { name: string; price: string; discountPrice?: string }[];
};

export type MenuProduct = {
  id: number;
  image: string;
};

export type MergedProduct = BackendProduct & { imageUrl: string | null };
