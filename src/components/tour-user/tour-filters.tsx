"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Filter, X } from "lucide-react"
import data from "@/data/data.json"

interface TourFiltersProps {
  selectedCategory?: string
  selectedProvince?: string
  priceRange?: number[]
  selectedDuration?: string
  className?: string
}

export function TourFilters({
  selectedCategory,
  selectedProvince,
  priceRange = [0, 1000],
  selectedDuration,
  className,
}: TourFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [category, setCategory] = useState<string | undefined>(selectedCategory)
  const [province, setProvince] = useState<string | undefined>(selectedProvince)
  const [price, setPrice] = useState<number[]>(priceRange)
  const [duration, setDuration] = useState<string | undefined>(selectedDuration)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Update local state when props change
  useEffect(() => {
    setCategory(selectedCategory)
    setProvince(selectedProvince)
    setPrice(priceRange)
    setDuration(selectedDuration)
  }, [selectedCategory, selectedProvince, priceRange, selectedDuration])

  // Create a new URLSearchParams when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    // Update or remove category parameter
    if (category) {
      params.set("category", category)
    } else {
      params.delete("category")
    }

    // Update or remove province parameter
    if (province) {
      params.set("province", province)
    } else {
      params.delete("province")
    }

    // Update price range parameters
    if (price[0] > 0) {
      params.set("minPrice", price[0].toString())
    } else {
      params.delete("minPrice")
    }

    if (price[1] < 1000) {
      params.set("maxPrice", price[1].toString())
    } else {
      params.delete("maxPrice")
    }

    // Update duration parameter
    if (duration) {
      params.set("duration", duration)
    } else {
      params.delete("duration")
    }

    // Reset to page 1 when filters change
    params.delete("page")

    // Update the URL with the new search parameters, but keep scroll position
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [category, province, price, duration, router, pathname, searchParams])

  const resetFilters = () => {
    setCategory(undefined)
    setProvince(undefined)
    setPrice([0, 1000])
    setDuration(undefined)
    router.push(pathname)
  }

  const hasActiveFilters = category || province || price[0] > 0 || price[1] < 1000 || duration

  // Desktop filters
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
                    ? 'bg-cyan-400 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
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
                onClick={() => setProvince(province === prov ? undefined : prov)}
                className={`py-2 px-4 rounded-md transition-colors cursor-pointer ${
                  province === prov
                    ? 'bg-cyan-400 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                {prov.replace(/_/g, ' ')}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3 text-gray-800">Price Range</h4>
          <div className="px-2">
            <div className="relative h-2 bg-gray-200 rounded mb-6">
              <div 
                className="absolute top-0 h-full bg-cyan-400 rounded" 
                style={{
                  left: `${(price[0] / 1000) * 100}%`,
                  right: `${100 - (price[1] / 1000) * 100}%`
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
              <span className="bg-gray-100 px-3 py-1 rounded text-sm">${price[0]}</span>
              <span className="bg-gray-100 px-3 py-1 rounded text-sm">${price[1]}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3 text-gray-800">Duration</h4>
          <div className="flex flex-col space-y-2">
            {[["1-3", "1-3 days"], ["4-7", "4-7 days"], ["8-14", "8-14 days"], ["15+", "15+ days"]].map(([value, label]) => (
              <div
                key={value}
                onClick={() => setDuration(duration === value ? undefined : value)}
                className={`py-2 px-4 rounded-md transition-colors cursor-pointer ${
                  duration === value
                    ? 'bg-cyan-400 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

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
            <div className="absolute inset-0 bg-black/30" onClick={() => setMobileFiltersOpen(false)}></div>
            <div className="relative w-4/5 max-w-sm bg-white h-full shadow-lg p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FiltersContent />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
