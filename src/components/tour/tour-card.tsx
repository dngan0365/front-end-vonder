import type { Tour } from "@/api/tour"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Edit } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { DeleteTourButton } from "./delete-tour-button"

interface TourCardProps {
  tour: Tour
}

export function TourCard({ tour }: TourCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        {tour.images && tour.images.length > 0 ? (
          <Image src={tour.images[0] || "/placeholder.svg"} alt={tour.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <MapPin className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="line-clamp-1">{tour.title}</CardTitle>
            <CardDescription className="line-clamp-1">{tour.province}</CardDescription>
          </div>
          <Badge>{tour.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{tour.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4" />
            <span>{tour.duration} days</span>
          </div>
          <div className="font-bold">${tour.price}</div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/agency/tours/${tour.id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
        <DeleteTourButton id={tour.id} />
      </CardFooter>
    </Card>
  )
}
