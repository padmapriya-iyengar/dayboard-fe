export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  weight: number; // in grams
  price: number; // in USD
  addedDate: string; // ISO date string
}
