import { getTourById } from "@/api/tour"
import { TourForm } from "@/components/tour/tour-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home, ChevronRight } from "lucide-react"
import { notFound } from "next/navigation"

interface EditTourPageProps {
  params: {
    id: string
  }
}

export default async function EditTourPage({ params }: EditTourPageProps) {
  // In a real app, you would handle errors properly
  const tour = await getTourById(params.id).catch(() => null)

  if (!tour) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/agency/dashboard">
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/agency/tours">Tours</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>Edit Tour</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Tour</h1>
        <p className="text-muted-foreground mt-2">Update the details of your tour package</p>
      </div>

      <TourForm tour={tour} />
    </div>
  )
}
