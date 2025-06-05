// amenitiesConfig.tsx
import { Wifi, Car, Waves, Dumbbell, Utensils, Wind, Heart, Plane, Ban } from "lucide-react";
import { ReactNode } from "react";

export type AmenityType =
  | "SWIMMING_POOL"
  | "SPA"
  | "FITNESS_CENTER"
  | "RESTAURANT"
  | "PARKING"
  | "WIFI"
  | "AIR_CONDITIONING"
  | "PET_ALLOWED"
  | "AIRPORT_SHUTTLE"
  | "NON_SMOKING";

export interface AmenityConfig {
  value: AmenityType;
  label: string;
  icon: ReactNode;
  color: string;
}

export const amenitiesConfig: AmenityConfig[] = [
  { 
    value: "WIFI", 
    label: "Free WiFi", 
    icon: <Wifi size={20} />,
    color: "bg-blue-50 border-blue-200 text-blue-700"
  },
  { 
    value: "SWIMMING_POOL", 
    label: "Swimming Pool", 
    icon: <Waves size={20} />,
    color: "bg-cyan-50 border-cyan-200 text-cyan-700"
  },
  { 
    value: "FITNESS_CENTER", 
    label: "Fitness Center", 
    icon: <Dumbbell size={20} />,
    color: "bg-red-50 border-red-200 text-red-700"
  },
  { 
    value: "RESTAURANT", 
    label: "Restaurant", 
    icon: <Utensils size={20} />,
    color: "bg-orange-50 border-orange-200 text-orange-700"
  },
  { 
    value: "PARKING", 
    label: "Free Parking", 
    icon: <Car size={20} />,
    color: "bg-gray-50 border-gray-200 text-gray-700"
  },
  { 
    value: "SPA", 
    label: "Spa & Wellness", 
    icon: <Heart size={20} />,
    color: "bg-pink-50 border-pink-200 text-pink-700"
  },
  { 
    value: "AIR_CONDITIONING", 
    label: "Air Conditioning", 
    icon: <Wind size={20} />,
    color: "bg-indigo-50 border-indigo-200 text-indigo-700"
  },
  { 
    value: "AIRPORT_SHUTTLE", 
    label: "Airport Shuttle", 
    icon: <Plane size={20} />,
    color: "bg-green-50 border-green-200 text-green-700"
  },
  { 
    value: "PET_ALLOWED", 
    label: "Pet Friendly", 
    icon: <span className="text-lg">🐕</span>,
    color: "bg-yellow-50 border-yellow-200 text-yellow-700"
  },
  { 
    value: "NON_SMOKING", 
    label: "Non-Smoking", 
    icon: <Ban size={20} />,
    color: "bg-purple-50 border-purple-200 text-purple-700"
  }
];

// Optional: Helper function to get amenity config by value
export const getAmenityConfig = (value: AmenityType): AmenityConfig | undefined => {
  return amenitiesConfig.find(config => config.value === value);
};

// Optional: Get amenity label by value
export const getAmenityLabel = (value: AmenityType): string => {
  return getAmenityConfig(value)?.label || value;
};