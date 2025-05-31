"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  dates: Date[]
  onDatesChange: (dates: Date[]) => void
}

export function DatePicker({ dates = [], onDatesChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelect = (date: Date | undefined) => {
    if (!date) return

    // Check if date is already selected
    const dateExists = dates.some((d) => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))

    if (dateExists) {
      // Remove date if already selected
      onDatesChange(dates.filter((d) => format(d, "yyyy-MM-dd") !== format(date, "yyyy-MM-dd")))
    } else {
      // Add date if not already selected
      onDatesChange([...dates, date])
    }
  }

  const removeDate = (dateToRemove: Date) => {
    onDatesChange(dates.filter((d) => format(d, "yyyy-MM-dd") !== format(dateToRemove, "yyyy-MM-dd")))
  }

  return (
    <div className="space-y-4">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dates.length > 0 ? `${dates.length} dates selected` : "Select dates"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={undefined}
            onSelect={handleSelect}
            disabled={(date) => date < new Date()}
            initialFocus
            modifiers={{
              selected: dates,
            }}
          />
        </PopoverContent>
      </Popover>

      {dates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {dates
            .sort((a, b) => a.getTime() - b.getTime())
            .map((date, i) => (
              <Badge key={i} variant="secondary" className="flex items-center gap-1">
                {format(date, "MMM d, yyyy")}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeDate(date)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
        </div>
      )}
    </div>
  )
}
