"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, X, Plane, Home, MapPin, Users, Gift } from "lucide-react";
import data from "@/data/data.json";

interface TourFiltersProps {
  className?: string;
}

export function TourFilters({ className }: TourFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL parameters
  const [category, setCategory] = useState<string | undefined>(
    searchParams.get("category") || undefined
  );
  const [province, setProvince] = useState<string | undefined>(
    searchParams.get("province") || undefined
  );
  const [price, setPrice] = useState<number[]>([
    searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : 0,
    searchParams.get("maxPrice")
      ? parseInt(searchParams.get("maxPrice")!)
      : 1000,
  ]);
  const [duration, setDuration] = useState<string | undefined>(
    searchParams.get("duration") || undefined
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync state with URL changes (e.g., from external components like ActiveFilters)
  useEffect(() => {
    const urlCategory = searchParams.get("category") || undefined;
    const urlProvince = searchParams.get("province") || undefined;
    const urlMinPrice = searchParams.get("minPrice")
      ? parseInt(searchParams.get("minPrice")!)
      : 0;
    const urlMaxPrice = searchParams.get("maxPrice")
      ? parseInt(searchParams.get("maxPrice")!)
      : 1000;
    const urlDuration = searchParams.get("duration") || undefined;

    setCategory(urlCategory);
    setProvince(urlProvince);
    setPrice([urlMinPrice, urlMaxPrice]);
    setDuration(urlDuration);
  }, [searchParams]);

  // Update URL when filters change (triggered by user interaction)
  useEffect(() => {
    const params = new URLSearchParams();

    if (category) params.set("category", category);
    if (province) params.set("province", province);
    if (price[0] > 0) params.set("minPrice", price[0].toString());
    if (price[1] < 1000) params.set("maxPrice", price[1].toString());
    if (duration) params.set("duration", duration);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [category, province, price, duration, router, pathname]);

  const resetFilters = () => {
    setCategory(undefined);
    setProvince(undefined);
    setPrice([0, 1000]);
    setDuration(undefined);
    router.push(pathname, { scroll: false });
  };

  const hasActiveFilters =
    category || province || price[0] > 0 || price[1] < 1000 || duration;

  // Desktop and Mobile filters content
  const FiltersContent = () => (
    <div className="space-y-6">
      {hasActiveFilters && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Filters</h3>
          <button
            onClick={resetFilters}
            className="flex items-center text-sm py-1 px-3 text-gray-700 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4 mr-1" />
            Reset
          </button>
        </div>
      )}

      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 shadow-sm border border-cyan-100">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 mb-4">
          Choose a place to go with your kids
        </h3>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          <a href="./flights" className="block">
            <div className="flex flex-col items-center p-4 rounded-xl bg-white hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white text-gray-700 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-100 group">
              <Plane className="w-6 h-6 mb-2 text-cyan-500 group-hover:text-white" />
              <span className="font-medium text-xs">Flights</span>
            </div>
          </a>

          <a href="./Hotels" className="block">
            <div className="flex flex-col items-center p-4 rounded-xl bg-white hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white text-gray-700 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-100 group">
              <Home className="w-6 h-6 mb-2 text-cyan-500 group-hover:text-white" />
              <span className="font-medium text-xs">Hotels</span>
            </div>
          </a>

          <a href="./Activities" className="block">
            <div className="flex flex-col items-center p-4 rounded-xl bg-white hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white text-gray-700 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-100 group">
              <MapPin className="w-6 h-6 mb-2 text-cyan-500 group-hover:text-white" />
              <span className="font-medium text-xs">Activities</span>
            </div>
          </a>

          <a href="./Family" className="block">
            <div className="flex flex-col items-center p-4 rounded-xl bg-white hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white text-gray-700 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-100 group">
              <Users className="w-6 h-6 mb-2 text-cyan-500 group-hover:text-white" />
              <span className="font-medium text-xs">Family</span>
            </div>
          </a>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold mb-3 text-gray-800">Category</h4>
          <div className="flex flex-col space-y-2 max-h-56 overflow-y-auto pr-2">
            {data.Category.map((cat) => (
              <div
                key={cat}
                onClick={() => setCategory(category === cat ? undefined : cat)}
                className={`py-2 px-4 rounded-md transition-colors cursor-pointer ${
                  category === cat
                    ? "bg-cyan-400 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3 text-gray-800">Province</h4>
          <div className="flex flex-col space-y-2 max-h-56 overflow-y-auto pr-2">
            {data.Province.map((prov) => (
              <div
                key={prov}
                onClick={() =>
                  setProvince(province === prov ? undefined : prov)
                }
                className={`py-2 px-4 rounded-md transition-colors cursor-pointer ${
                  province === prov
                    ? "bg-cyan-400 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                }`}
              >
                {prov.replace(/_/g, " ")}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3 text-gray-800">
            Price Range
          </h4>
          <div className="px-2">
            <div className="relative h-2 bg-gray-200 rounded mb-6">
              <div
                className="absolute top-0 h-full bg-cyan-400 rounded"
                style={{
                  left: `${(price[0] / 1000) * 100}%`,
                  right: `${100 - (price[1] / 1000) * 100}%`,
                }}
              ></div>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={price[0]}
                onChange={(e) => setPrice([parseInt(e.target.value), price[1]])}
                className="absolute w-full h-2 opacity-0 cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={price[1]}
                onChange={(e) => setPrice([price[0], parseInt(e.target.value)])}
                className="absolute w-full h-2 opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex justify-between font-medium text-gray-700">
              <span className="bg-gray-100 px-3 py-1 rounded text-sm">
                ${price[0]}
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded text-sm">
                ${price[1]}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3 text-gray-800">Duration</h4>
          <div className="flex flex-col space-y-2">
            {[
              ["1-3", "1-3 days"],
              ["4-7", "4-7 days"],
              ["8-14", "8-14 days"],
              ["15+", "15+ days"],
            ].map(([value, label]) => (
              <div
                key={value}
                onClick={() =>
                  setDuration(duration === value ? undefined : value)
                }
                className={`py-2 px-4 rounded-md transition-colors cursor-pointer ${
                  duration === value
                    ? "bg-cyan-400 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop filters */}
      <div className={`hidden md:block ${className}`}>
        <FiltersContent />
      </div>

      {/* Mobile filters */}
      <div className="md:hidden mb-6">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 bg-white rounded-md hover:bg-gray-50"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-cyan-400 text-white rounded-full px-2 py-0.5 text-xs">
              Active
            </span>
          )}
        </button>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobileFiltersOpen(false)}
            ></div>
            <div className="relative w-4/5 max-w-sm bg-white h-full shadow-lg p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Filters</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="text-gray-500 hover:bg-gray-100 p-1 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FiltersContent />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
