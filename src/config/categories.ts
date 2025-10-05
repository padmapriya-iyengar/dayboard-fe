// Category configuration for grocery inventory
export interface Category {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

export const GROCERY_CATEGORIES: Category[] = [
  {
    value: "fruits",
    label: "Fruits",
    icon: "🍎",
    description: "Fresh and dried fruits",
  },
  {
    value: "vegetables",
    label: "Vegetables",
    icon: "🥕",
    description: "Fresh vegetables and greens",
  },
  {
    value: "dairy",
    label: "Dairy Products",
    icon: "🥛",
    description: "Milk, cheese, yogurt and dairy items",
  },
  {
    value: "grains",
    label: "Grains & Cereals",
    icon: "🌾",
    description: "Rice, wheat, oats and grain products",
  },
  {
    value: "snacks",
    label: "Snacks",
    icon: "🍿",
    description: "Chips, crackers and snack foods",
  },
  {
    value: "beverages",
    label: "Beverages",
    icon: "🥤",
    description: "Drinks, juices and beverages",
  },
  {
    value: "condiments",
    label: "Condiments & Spices",
    icon: "🧂",
    description: "Sauces, spices and seasonings",
  },
  {
    value: "household",
    label: "Household Items",
    icon: "🧽",
    description: "Cleaning supplies and household goods",
  },
  {
    value: "other",
    label: "Other",
    icon: "📦",
    description: "Miscellaneous items",
  },
];

// Helper functions
export const getCategoryByValue = (value: string): Category | undefined => {
  return GROCERY_CATEGORIES.find((cat) => cat.value === value);
};

export const getCategoryLabel = (value: string): string => {
  const category = getCategoryByValue(value);
  return category?.label || "Unknown Category";
};

export const getCategoryIcon = (value: string): string => {
  const category = getCategoryByValue(value);
  return category?.icon || "📦";
};
