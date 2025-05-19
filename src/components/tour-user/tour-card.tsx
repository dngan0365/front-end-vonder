import type { Tour } from "@/api/tour"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-200">
      <div className="relative h-48 w-full">
        <Link href={`/travel/${tour.id}`}>
          {tour.images && tour.images.length > 0 ? (
            <Image
              src={tour.images[0] || "/placeholder.svg"}
              alt={tour.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <MapPin className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/50" />
          <Badge className="absolute top-3 right-3">{tour.category}</Badge>
        </Link>
      </div>

      <CardContent className="flex-grow pt-4">
        <Link href={`/travel/${tour.id}`} className="hover:underline">
          <h3 className="text-xl font-semibold mb-2 line-clamp-2">{tour.title}</h3>
        </Link>
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{formattedProvince}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {/* Strip HTML tags for the card preview */}
          {tour.description.replace(/<[^>]*>/g, "")}
        </p>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{tour.duration} days</span>
          </div>
          {tour.maxCapacity && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>Max {tour.maxCapacity} people</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 flex justify-between items-center">
        <div>
          <span className="text-sm text-muted-foreground">From</span>
          <p className="text-lg font-bold">{formattedPrice}</p>
        </div>
        <Link href={`/travel/${tour.id}`}>
          <Button>View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
