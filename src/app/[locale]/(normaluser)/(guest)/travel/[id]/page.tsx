import { getTourById } from "@/api/tour"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TourGallery } from "@/components/tour-user/tour-gallery"
import { TourItinerary } from "@/components/tour-user/tour-itinerary"
import { TourBookingForm } from "@/components/tour-user/tour-booking-form"
import { TourReviewsSection } from "@/components/tour-user/tour-reviews-section"
import { Clock, MapPin, Users, CheckCircle, XCircle } from "lucide-react"

interface TourPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: TourPageProps) {
  try {
    const tour = await getTourById(params.id)

    return {
      title: `${tour.title} | Travel Agency`,
      description: tour.description.replace(/<[^>]*>/g, "").substring(0, 160),
    }
  } catch (error) {
    return {
      title: "Tour Not Found | Travel Agency",
      description: "The requested tour could not be found.",
    }
  }
}

export default async function TourPage({ params }: TourPageProps) {
  // Fetch tour details
  const tour = await getTourById(params.id).catch(() => null)

  if (!tour) {
    notFound()
  }

  // Format price to display with commas and 2 decimal places if needed
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: tour.price % 1 === 0 ? 0 : 2,
  }).format(tour.price)

  // Format province name for display (replace underscores with spaces and capitalize)
  const formattedProvince = tour.province
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())

  // Parse includes and excludes if they exist
  const includes = tour.includes ? tour.includes.split("\n").filter(Boolean) : []
  const excludes = tour.excludes ? tour.excludes.split("\n").filter(Boolean) : []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - 2/3 width on desktop */}
        <div className="lg:col-span-2">
          {/* Tour gallery */}
          <TourGallery images={tour.images} tourName={tour.title} />

          {/* Tour header */}
          <div className="mt-6">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge>{tour.category}</Badge>
              <Badge variant="outline">{formattedProvince}</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">{tour.title}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{tour.duration} days</span>
              </div>
              {tour.maxCapacity && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Max {tour.maxCapacity} people</span>
                </div>
              )}
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{formattedProvince}</span>
              </div>
            </div>
          </div>

          {/* Tour description */}
          <div className="prose max-w-none mb-8">
            <h2 className="text-2xl font-semibold mb-4">Tour Overview</h2>
            <div dangerouslySetInnerHTML={{ __html: tour.description }} />
          </div>

          <Separator className="my-8" />

          {/* Tour itinerary */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Itinerary</h2>
            <TourItinerary itinerary={tour.itinerary} duration={tour.duration} />
          </div>

          <Separator className="my-8" />

          {/* What's included/excluded */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">What's Included</h2>
              <ul className="space-y-2">
                {includes.length > 0 ? (
                  includes.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground">No information provided</li>
                )}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">What's Excluded</h2>
              <ul className="space-y-2">
                {excludes.length > 0 ? (
                  excludes.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground">No information provided</li>
                )}
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Tour Reviews Section */}
          <div className="mb-8">
            <TourReviewsSection tourId={tour.id} />
          </div>
        </div>

        {/* Sidebar - 1/3 width on desktop */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <TourBookingForm
              tourId={tour.id}
              tourName={tour.title}
              price={tour.price}
              startDates={tour.startDates || []}
              maxCapacity={tour.maxCapacity || 10}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
