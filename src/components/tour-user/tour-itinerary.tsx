"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Calendar } from "lucide-react"

interface ItineraryDay {
  day: number
  title: string
  description: string
}

interface TourItineraryProps {
  itinerary?: string
  duration: number
}

export function TourItinerary({ itinerary, duration }: TourItineraryProps) {
  // Parse the itinerary JSON string, or create a default itinerary based on duration
  const [days, setDays] = useState<ItineraryDay[]>(() => {
    if (itinerary) {
      try {
        return JSON.parse(itinerary) as ItineraryDay[]
      } catch (error) {
        console.error("Failed to parse itinerary:", error)
      }
    }

    // Default itinerary if parsing fails or no itinerary provided
    return Array.from({ length: duration }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}`,
      description: "Details for this day are not available.",
    }))
  })

  return (
    <Accordion type="single" collapsible className="w-full">
      {days.map((day) => (
        <AccordionItem key={day.day} value={`day-${day.day}`}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center">
              <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="font-medium">Day {day.day}</span>
                <p className="text-sm text-muted-foreground">{day.title}</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pl-14 pr-4 py-2">
                <div
                className="text-muted-foreground whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: day.description }}
                />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
