// Category configuration for grocery inventory
export interface Category {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

export const GROCERY_CATEGORIES: Category[] = [
  {
    value: "spices",
    label: "Spices",
    icon: "",
    description: "Spices and seasonings",
  },
  {
    value: "sweet_confectionary",
    label: "Sweet & Confectionary",
    icon: "",
    description: "Sweets, chocolates and confectionary items",
  },
  {
    value: "pulses",
    label: "Pulses",
    icon: "",
    description: "Lentils, beans and pulses",
  },
  {
    value: "flour",
    label: "Flour",
    icon: "",
    description: "Flour and grain powders",
  },
  {
    value: "oil_ghee",
    label: "Oil & Ghee",
    icon: "",
    description: "Cooking oils, ghee and fats",
  },
  {
    value: "rice_breakfast",
    label: "Rice & Breakfast",
    icon: "",
    description: "Rice, breakfast cereals and grains",
  },
  {
    value: "whole_spices",
    label: "Whole Spices",
    icon: "",
    description: "Whole spices and herbs",
  },
  {
    value: "cleaning",
    label: "Cleaning",
    icon: "",
    description: "Cleaning supplies and detergents",
  },
  {
    value: "personal_care",
    label: "Personal Care",
    icon: "",
    description: "Personal care and hygiene products",
  },
  {
    value: "pooja_items",
    label: "Pooja Items",
    icon: "",
    description: "Religious and pooja items",
  },
  {
    value: "dry_fruits",
    label: "Dry Fruits",
    icon: "",
    description: "Dry fruits and nuts",
  },
  {
    value: "fruits_vegetables",
    label: "Fruits & Vegetables",
    icon: "",
    description: "Fresh fruits and vegetables",
  },
  {
    value: "others",
    label: "Others",
    icon: "",
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
  return category?.icon || "";
};
