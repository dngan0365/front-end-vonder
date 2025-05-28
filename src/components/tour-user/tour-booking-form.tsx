"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-toastify"
import { createTourBooking } from "@/api/tourBooking"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/AuthContext"

interface TourBookingFormProps {
  tourId: string
  tourName: string
  price: number
  startDates?: Date[]
  maxCapacity: number
}

export function TourBookingForm({ tourId, tourName, price, startDates = [], maxCapacity }: TourBookingFormProps) {
  const router = useRouter()

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    startDates.length > 0 ? new Date(startDates[0]) : undefined,
  )
  const [participants, setParticipants] = useState(1)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user} = useAuth();

  // Calculate total price
  const totalPrice = price * participants

  // Format price to display with commas and 2 decimal places if needed
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price)

  // Format total price
  const formattedTotalPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: totalPrice % 1 === 0 ? 0 : 2,
  }).format(totalPrice)

  // Generate options for participants select
  const participantOptions = Array.from({ length: maxCapacity }, (_, i) => i + 1)

  // Handle booking submission
  const handleBooking = async () => {
    if (!selectedDate) {
      toast.warn("You need to select a start date for your tour.")
      return
    }

    setIsSubmitting(true)

    try {
      // Create booking using the API
      const bookingData = {
        tourId,
        bookingDate: selectedDate,
        participants,
        notes: notes.trim() || undefined,
      }

      if (!user?.id) {
        toast.error("You must be logged in to book a tour.")
        setIsSubmitting(false)
        return
      }
      const booking = await createTourBooking(user?.id, bookingData)

      toast.success(`Your booking for ${tourName} has been confirmed.`)

      // Redirect to booking confirmation page
      router.push(`/bookings/${booking.id}`)
    } catch (error) {
      console.error("Booking error:", error)
      toast.error("There was an error processing your booking. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book This Tour</CardTitle>
        <CardDescription>Select your preferred date and number of participants</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal" id="date">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => {
                  // Disable dates in the past
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)

                  // If startDates is provided and not empty, only enable those dates
                  if (startDates && startDates.length > 0) {
                    return (
                      date < today ||
                      !startDates.some((startDate) => {
                        const d = new Date(startDate)
                        return (
                          d.getDate() === date.getDate() &&
                          d.getMonth() === date.getMonth() &&
                          d.getFullYear() === date.getFullYear()
                        )
                      })
                    )
                  }

                  // Otherwise just disable past dates
                  return date < today
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="participants">Number of Participants</Label>
          <Select value={participants.toString()} onValueChange={(value) => setParticipants(Number.parseInt(value))}>
            <SelectTrigger id="participants">
              <SelectValue placeholder="Select number of participants" />
            </SelectTrigger>
            <SelectContent>
              {participantOptions.map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "person" : "people"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Special Requests or Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any special requests or dietary requirements?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Price per person:</span>
            <span>{formattedPrice}</span>
          </div>
          <div className="flex justify-between font-medium text-lg">
            <span>Total price:</span>
            <span>{formattedTotalPrice}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleBooking} disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Book Now"}
        </Button>
      </CardFooter>
    </Card>
  )
}
