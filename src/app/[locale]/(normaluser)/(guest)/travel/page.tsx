"use client";

import { getTours } from "@/api/tour";
import { TourCard } from "@/components/tour-user/tour-card";
import { TourFilters } from "@/components/tour-user/tour-filters";
import { ActiveFilters } from "@/components/tour-user/active-filters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
import { Suspense, useState, useEffect } from "react";
import { Compass, Search } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ToursPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State for tours and pagination
  const [tours, setTours] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Extract parameters from URL
  const category = searchParams.get("category") || undefined;
  const province = searchParams.get("province") || undefined;
  const minPrice = searchParams.get("minPrice") ? Number.parseInt(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number.parseInt(searchParams.get("maxPrice")) : undefined;
  const duration = searchParams.get("duration") || undefined;
  const search = searchParams.get("q") || undefined;
  const page = searchParams.get("page") ? Number.parseInt(searchParams.get("page")) : 1;
  const limit = 12;

  // Fetch tours based on URL parameters
  const fetchTours = async () => {
    setIsLoading(true);
    try {
      const result = await getTours({
        category,
        province,
        minPrice,
        maxPrice,
        duration,
        q: search,
        page,
        limit,
      });
      setTours(result.tours);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Failed to fetch tours:", error);
      setTours([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tours when URL parameters change
  useEffect(() => {
    fetchTours();
  }, [category, province, minPrice, maxPrice, duration, search, page]);

  // Initialize search query from URL
  useEffect(() => {
    if (search) {
      setSearchQuery(search);
    }
  }, [search]);

  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      // Clear search if empty
      const params = new URLSearchParams(searchParams.toString());
      params.delete("q");
      params.set("page", "1");
      router.push(`?${params.toString()}`);
      return;
    }

    setIsSearching(true);
    
    try {
      // Update URL with search query
      const params = new URLSearchParams(searchParams.toString());
      params.set("q", searchQuery);
      params.set("page", "1"); // Reset to first page
      router.push(`?${params.toString()}`);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const currentSearch = search;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Sidebar with filters */}
        <div className="w-full md:w-1/4 lg:w-1/5 sticky top-24">
          <TourFilters />
        </div>

        {/* Main content */}
        <div className="w-full md:w-3/4 lg:w-4/5">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Explore Tours</h1>
            <p className="text-muted-foreground">
              Discover amazing travel experiences across Vietnam
            </p>
            {(search) && (
              <p className="text-sm text-muted-foreground mt-2">
                Search results for "{currentSearch}" ({pagination.totalItems} found)
              </p>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative mb-6">
            <Input
              type="text"
              placeholder="Search for tours, destinations, activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-20"
              disabled={isSearching}
            />
            <div className="absolute right-1 top-1 flex gap-1">
              {searchQuery && (
                <Button 
                  type="button"
                  onClick={handleClearSearch}
                  size="icon" 
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  ✕
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
              <Button 
                type="submit" 
                size="icon" 
                className="h-8 w-8"
                disabled={isSearching || !searchQuery.trim()}
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </div>
          </form>

          {/* Active filters display */}
          <ActiveFilters
            category={category}
            province={province}
            minPrice={minPrice}
            maxPrice={maxPrice}
            duration={duration}
            search={currentSearch}
          />

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div>Loading tours...</div>
            </div>
          ) : (
            <>
              {tours.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {tours.map((tour) => (
                      <TourCard key={tour.id} tour={tour} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center">
                      <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        hasNext={pagination.hasNext}
                        hasPrev={pagination.hasPrev}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Compass className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {currentSearch ? "No search results" : "No tours found"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {currentSearch
                      ? `We couldn't find any tours matching "${currentSearch}".`
                      : "We couldn't find any tours matching your criteria."}
                  </p>
                  <p className="text-muted-foreground">
                    Try adjusting your {currentSearch ? "search terms or " : ""}filters.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}