"use client";

import { Location } from "@/api/location";
import { useFavorites } from "@/hooks/useFavorite";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface FavoriteButtonProps {
  location: Location;
  className?: string;
}

export default function FavoriteButton({ location, className = "" }: FavoriteButtonProps) {
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const [isFavorite, setIsFavorite] = useState(false);
  const t = useTranslations("LocationDetail");

  useEffect(() => {
    // Check if this location is in favorites by comparing IDs
    console.log("Checking favorites:", favorites, location.id); // Log the favorites and location ID
    const isCurrentFavorite = favorites.some(fav => fav.id === location.id);
    setIsFavorite(isCurrentFavorite);
  }, [favorites, location.id]);

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavorite(location);
    } else {
      addFavorite(location);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
        isFavorite 
          ? "bg-red-100 text-red-600 hover:bg-red-200" 
          : "bg-gray-200 hover:bg-gray-300"
      } ${className}`}
      aria-label={isFavorite ? t("removeFromFavorites") : t("addToFavorites")}
    >
      <Heart 
        className={isFavorite ? "fill-red-500 text-red-500" : ""} 
        size={20} 
      />
      <span className="font-medium">
        {isFavorite ? t("removeFromFavorites") : t("addToFavorites")}
      </span>
    </button>
  );
}
