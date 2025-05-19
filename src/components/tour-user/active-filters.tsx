"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { useTransition } from "react"

interface ActiveFiltersProps {
  category?: string
  province?: string
  minPrice?: number
  maxPrice?: number
  duration?: string
}

export function ActiveFilters({
  category,
  province,
  minPrice,
  maxPrice,
  duration,
}: ActiveFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Don't render if no filters are active
  if (!category && !province && !minPrice && !maxPrice && !duration) {
    return null
  }

  const removeFilter = (filterName: string) => {
    const current = new URLSearchParams(searchParams.toString())
    current.delete(filterName)
    current.delete("page") // Reset to page 1 when filters change
    
    startTransition(() => {
      // Use router.replace with scroll=false option
      router.replace(`${pathname}?${current.toString()}`, { scroll: false })
    })
  }

  const clearAllFilters = () => {
    startTransition(() => {
      // Use router.replace with scroll=false option
      router.replace(pathname, { scroll: false })
    })
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4" aria-live="polite">
      <div className="text-sm mr-1 flex items-center text-gray-600">
        Active filters:
      </div>
      
      {category && (
        <span className="inline-flex items-center bg-cyan-100 text-cyan-800 text-sm px-3 py-1 rounded-full">
          Category: {category.charAt(0).toUpperCase() + category.slice(1)}
          <button 
            onClick={() => removeFilter("category")}
            disabled={isPending}
            className="ml-1 hover:bg-cyan-200 rounded-full p-0.5"
            aria-label="Remove category filter"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
      
      {province && (
        <span className="inline-flex items-center bg-cyan-100 text-cyan-800 text-sm px-3 py-1 rounded-full">
          Province: {province.replace(/_/g, ' ')}
          <button 
            onClick={() => removeFilter("province")}
            disabled={isPending}
            className="ml-1 hover:bg-cyan-200 rounded-full p-0.5"
            aria-label="Remove province filter"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
      
      {(minPrice || maxPrice) && (
        <span className="inline-flex items-center bg-cyan-100 text-cyan-800 text-sm px-3 py-1 rounded-full">
          Price: ${minPrice || 0} - ${maxPrice || 1000}
          <button 
            onClick={() => {
              removeFilter("minPrice");
              removeFilter("maxPrice");
            }}
            disabled={isPending}
            className="ml-1 hover:bg-cyan-200 rounded-full p-0.5"
            aria-label="Remove price filter"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
      
      {duration && (
        <span className="inline-flex items-center bg-cyan-100 text-cyan-800 text-sm px-3 py-1 rounded-full">
          Duration: {duration.replace("+", "+")} days
          <button 
            onClick={() => removeFilter("duration")}
            disabled={isPending}
            className="ml-1 hover:bg-cyan-200 rounded-full p-0.5"
            aria-label="Remove duration filter"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
      
      <button 
        onClick={clearAllFilters}
        disabled={isPending}
        className="text-sm text-gray-600 underline hover:text-cyan-600"
      >
        Clear all
      </button>
    </div>
  )
}
