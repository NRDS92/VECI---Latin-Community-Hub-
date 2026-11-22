import type { BusinessPriceRange } from "@ndrs92/contracts";

export type BusinessFormValues = {
  name: string;
  description: string;
  category: string;
  subCategory: string;
  priceRange: BusinessPriceRange | undefined;
  phone: string;
  instagram: string;
  image: string;
  menu: string;
  address: string;
  cityId: string;
  coordinates: { latitude: number; longitude: number };
};
