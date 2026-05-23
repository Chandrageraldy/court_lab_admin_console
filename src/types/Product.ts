import type { Brand } from "./Brand";
import type { Category } from "./Category";

export interface Product {
  product_id: number;
  name: string;
  created_at: string;
  selling_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  image_url: string;
  description: string;
  is_deleted: boolean;
  is_active: boolean;
  category_id: number;
  category: Category;
  brand_id: number;
  brand: Brand;
}
