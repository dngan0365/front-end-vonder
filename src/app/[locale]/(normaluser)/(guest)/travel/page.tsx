import { getTours } from "@/api/tour";
import { TourCard } from "@/components/tour-user/tour-card";
import { TourFilters } from "@/components/tour-user/tour-filters";
import { ActiveFilters } from "@/components/tour-user/active-filters";
import { SearchBar } from "@/components/tour-user/search-bar";
import { Suspense } from "react";
import { Compass } from "lucide-react";

export const metadata = {
  title: "Explore Tours | Travel Agency",
  description: "Discover amazing tours and travel experiences across Vietnam",
};

export default async function ToursPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const rawParams = await searchParams;
  
  // Now you can safely access properties
  const category = typeof rawParams.category === "string" ? rawParams.category : undefined;
  const province = typeof rawParams.province === "string" ? rawParams.province : undefined;
  const minPrice = typeof rawParams.minPrice === "string" ? Number.parseInt(rawParams.minPrice) : undefined;
  const maxPrice = typeof rawParams.maxPrice === "string" ? Number.parseInt(rawParams.maxPrice) : undefined;
  const duration = typeof rawParams.duration === "string" ? rawParams.duration : undefined;
  const page = typeof rawParams.page === "string" ? Number.parseInt(rawParams.page) : 1;
  const limit = 12;

  // Fetch tours with filters
  const tours = await getTours({
    category,
    province,
    minPrice,
    maxPrice,
    duration,
    page,
    limit,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Sidebar with filters */}
        <div className="w-full md:w-1/4 lg:w-1/5 sticky top-24">
          <TourFilters
            selectedCategory={category}
            selectedProvince={province}
            priceRange={[minPrice || 0, maxPrice || 1000]}
            // Also pass the duration so it stays in sync
            selectedDuration={duration}
          />
        </div>

        {/* Main content */}
        <div className="w-full md:w-3/4 lg:w-4/5">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Explore Tours</h1>
            <p className="text-muted-foreground">
              Discover amazing travel experiences across Vietnam
            </p>
          </div>

          <SearchBar className="mb-6" />

          {/* Active filters display */}
          <ActiveFilters
            category={category}
            province={province}
            minPrice={minPrice}
            maxPrice={maxPrice}
            duration={duration}
          />

          <Suspense fallback={<div>Loading tours...</div>}>
            {tours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Compass className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tours found</h3>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any tours matching your criteria.
                </p>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search for something else.
                </p>
              </div>
            )}
          </Suspense>

          {/* Pagination would go here */}
        </div>
      </div>
    </div>
  );
}
