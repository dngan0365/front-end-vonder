"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import TinyMCEEditor from "../TinymceEditor"

interface ItineraryDay {
  day: number
  title: string
  description: string
}

interface ItineraryEditorProps {
  value: string
  onChange: (value: string) => void
  days: number
}

export function ItineraryEditor({ value, onChange, days }: ItineraryEditorProps) {
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(() => {
    try {
      return JSON.parse(value) as ItineraryDay[]
    } catch {
      return [{ day: 1, title: "Day 1", description: "Start of the tour" }]
    }
  })

  // Update itinerary when days change
  useEffect(() => {
    const currentDays = itinerary.length

    if (days > currentDays) {
      // Add new days
      const newDays = Array.from({ length: days - currentDays }, (_, i) => ({
        day: currentDays + i + 1,
        title: `Day ${currentDays + i + 1}`,
        description: "",
      }))

      setItinerary([...itinerary, ...newDays])
    } else if (days < currentDays) {
      // Remove excess days
      setItinerary(itinerary.slice(0, days))
    }
  }, [days])

  // Update parent form when itinerary changes
  useEffect(() => {
    onChange(JSON.stringify(itinerary))
  }, [itinerary, onChange])

  const handleDayChange = (index: number, field: keyof ItineraryDay, value: string) => {
    const newItinerary = [...itinerary]
    newItinerary[index] = {
      ...newItinerary[index],
      [field]: field === "day" ? Number.parseInt(value) : value,
    }
    setItinerary(newItinerary)
  }

  const addDay = () => {
    const newDay = {
      day: itinerary.length + 1,
      title: `Day ${itinerary.length + 1}`,
      description: "",
    }
    setItinerary([...itinerary, newDay])
  }

  const removeDay = (index: number) => {
    const newItinerary = [...itinerary]
    newItinerary.splice(index, 1)

    // Renumber days
    newItinerary.forEach((day, i) => {
      day.day = i + 1
      if (day.title.startsWith("Day ")) {
        day.title = `Day ${i + 1}`
      }
    })

    setItinerary(newItinerary)
  }

  return (
    <div className="space-y-4">
      {itinerary.map((day, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Day {day.day}</CardTitle>
              {itinerary.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeDay(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Day title"
                value={day.title}
                onChange={(e) => handleDayChange(index, "title", e.target.value)}
              />
            </div>
            <div>
              <TinyMCEEditor
                value={day.description}
                onChange={(content) => handleDayChange(index, "description", content)}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" className="w-full" onClick={addDay}>
        <Plus className="h-4 w-4 mr-2" />
        Add Day
      </Button>
    </div>
  )
}
