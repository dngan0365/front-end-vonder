import type { Tour } from "@/api/tour"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { StarRating } from "./star-rating"

interface TourCardProps {
  tour: Tour
}

export function TourCard({ tour }: TourCardProps) {
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

  return (
    <Link href={`/travel/${tour.id}`}>
      <Card className="overflow-hidden h-full transition-all hover:shadow-md">
        <div className="relative h-48">
          {tour.images?.length > 0 ? (
            <Image
              src={tour.images[0]}
              alt={tour.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          <Badge className="absolute top-2 left-2">{tour.category}</Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-xl mb-2 line-clamp-2">{tour.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            <span>{formattedProvince}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span>{tour.duration} days</span>
          </div>
          {typeof tour.averageRating === "number" && tour.averageRating > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <StarRating
                rating={tour.averageRating}
                size={14}
              />
              <span className="text-sm font-medium">
                {tour.averageRating.toFixed(1)}
                <span className="text-muted-foreground text-xs ml-1">
                  ({tour.totalReviews || 0} {tour.totalReviews === 1 ? 'review' : 'reviews'})
                </span>
              </span>
            </div>
          )}
          <p className="text-sm line-clamp-2 text-muted-foreground">
            {tour.description?.replace(/<[^>]*>/g, "")}
          </p>
        </CardContent>
        <CardFooter className="px-4 py-3 bg-muted/40 flex justify-between items-center">
          <div>
            <p className="font-semibold">{formattedPrice}</p>
            <p className="text-xs text-muted-foreground">per person</p>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
