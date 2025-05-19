"use client"
import { getToursByAgency } from "@/api/tour"
import { TourCard } from "@/components/tour/tour-card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { TourFilters } from "@/components/tour/tour-filters"
import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"
import { Tour } from "@/api/tour"

export default function ToursPage() {
  const { user } = useAuth();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTours() {
      if (user && user.role === "agency") {
        try {
          const fetchedTours = await getToursByAgency(user.id);
          setTours(fetchedTours);
        } catch (error) {
          console.error("Failed to fetch tours:", error);
          setTours([]);
        }
      }
      setLoading(false);
    }

    fetchTours();
  }, [user]);

  if (!user || user.role !== "agency") {
    return <div className="text-center py-12">You are not authorized to view this page.</div>
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Tours</h1>
        <Link href="/agency/tours/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Tour
          </Button>
        </Link>
      </div>

      <TourFilters />

      {tours.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">No tours found</h2>
          <p className="text-muted-foreground mb-6">You haven't created any tours yet.</p>
          <Link href="/agency/tours/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Tour
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  )
}