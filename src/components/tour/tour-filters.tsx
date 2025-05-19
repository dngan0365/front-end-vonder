"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { TourFilterParams } from "@/api/tour"
import { Search, Filter, X } from "lucide-react"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function TourFilters() {
  const [filters, setFilters] = useState<TourFilterParams>({
    page: 1,
    limit: 10,
  })
  const [priceRange, setPriceRange] = useState([0, 1000])

  const handleFilterChange = (key: keyof TourFilterParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value)
    setFilters((prev) => ({
      ...prev,
      minPrice: value[0],
      maxPrice: value[1],
    }))
  }

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
    })
    setPriceRange([0, 1000])
  }

  return (
    <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
      <div className="relative w-full md:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search tours..." className="w-full pl-8" />
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="h-10">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filter Tours</SheetTitle>
            <SheetDescription>Narrow down your tour list with these filters</SheetDescription>
          </SheetHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">Natural</SelectItem>
                  <SelectItem value="historical">Historical</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="religious">Religious</SelectItem>
                  <SelectItem value="urban">Urban</SelectItem>
                  <SelectItem value="beach">Beach</SelectItem>
                  <SelectItem value="mountain">Mountain</SelectItem>
                  <SelectItem value="adventure">Adventure</SelectItem>
                  <SelectItem value="resort">Resort</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Select value={filters.province} onValueChange={(value) => handleFilterChange("province", value)}>
                <SelectTrigger id="province">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HO_CHI_MINH">Ho Chi Minh</SelectItem>
                  <SelectItem value="HA_NOI">Ha Noi</SelectItem>
                  <SelectItem value="DA_NANG">Da Nang</SelectItem>
                  {/* Add more provinces as needed */}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Price Range</Label>
                <span className="text-sm text-muted-foreground">
                  ${priceRange[0]} - ${priceRange[1]}
                </span>
              </div>
              <Slider
                defaultValue={[0, 1000]}
                max={1000}
                step={10}
                value={priceRange}
                onValueChange={handlePriceChange}
              />
            </div>
          </div>
          <SheetFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={resetFilters}>
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <SheetClose asChild>
              <Button>Apply Filters</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
