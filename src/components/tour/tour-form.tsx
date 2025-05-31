"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createTour, updateTour, type Tour, type CreateTourDto, type UpdateTourDto } from "@/api/tour"
import { MultiImageUploader } from "@/components/multi-image-uploader"
import { ItineraryEditor } from "./itinerary-editor"
import { DatePicker } from "@/components/DatePicker"
import { toast } from "react-toastify"
import { useAuth } from "@/context/AuthContext"
import data from "@/data/data.json"

const formSchema = z.object({
  title: z.string().min(3, { message: "Tour title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce.number().positive({ message: "Price must be a positive number" }),
  duration: z.coerce.number().int().positive({ message: "Duration must be a positive integer" }),
  category: z.string({ required_error: "Please select a category" }),
  province: z.string({ required_error: "Please select a province" }),
  images: z.array(z.string()).optional(),
  itinerary: z.string().optional(),
  includes: z.string().optional(),
  excludes: z.string().optional(),
  startDates: z.array(z.date()).optional(),
  maxCapacity: z.coerce.number().int().positive({ message: "Max capacity must be a positive integer" }),
})

interface TourFormProps {
  tour?: Tour
}

export function TourForm({ tour }: TourFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const {user} = useAuth();
  const [agencyId, setAgencyId] = useState(user?.role === "agency" ? user.id : null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: tour?.title || "",
      description: tour?.description || "",
      price: tour?.price || 0,
      duration: tour?.duration || 1,
      category: tour?.category || "",
      province: tour?.province || "",
      images: tour?.images || [],
      itinerary: tour?.itinerary || JSON.stringify([{ day: 1, title: "Day 1", description: "Start of the tour" }]),
      includes: tour?.includes || "",
      excludes: tour?.excludes || "",
      startDates: tour?.startDates || [],
      maxCapacity: tour?.maxCapacity || 10,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      if (tour) {
        // Update existing tour
        const updateData: UpdateTourDto = {
          title: values.title,
          description: values.description,
          price: values.price,
          duration: values.duration,
          category: values.category,
          province: values.province,
          images: values.images,
          itinerary: values.itinerary,
          includes: values.includes,
          excludes: values.excludes,
          startDates: values.startDates,
          maxCapacity: values.maxCapacity,
        }
        await updateTour(tour.id, updateData)
        toast.success("Your tour has been successfully updated.")
      } else {
        // Create new tour
        const createData: CreateTourDto = {
          title: values.title,
          description: values.description,
          price: values.price,
          duration: values.duration,
          category: values.category,
          province: values.province,
          images: values.images,
          itinerary: values.itinerary,
          includes: values.includes,
          excludes: values.excludes,
          startDates: values.startDates,
          maxCapacity: values.maxCapacity,
        }
        if (!agencyId) {
          toast.error("Agency is not authenticated.")
          return
        }
        await createTour(createData, agencyId)
        toast.success("Your new tour has been successfully created.")
      }

      router.push("/agency/tours")
      router.refresh()
    } catch (error) {
      toast.error(tour ? "Failed to update tour" : "Failed to create tour")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mb-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="details">Details & Pricing</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tour Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter tour title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your tour" className="min-h-32" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="natural">Natural</SelectItem>
                              <SelectItem value="historical">Historical</SelectItem>
                              <SelectItem value="cultural">Cultural</SelectItem>
                              <SelectItem value="religious">Religious</SelectItem>
                              <SelectItem value="urban">Urban</SelectItem>
                              <SelectItem value="beach">Beach</SelectItem>
                              <SelectItem value="mountain">Mountain</SelectItem>
                              <SelectItem value="adventure">Adventure</SelectItem>
                              <SelectItem value="resort">Resort</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Province</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a province" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {data.Province.map((province) => (
                                <SelectItem key={province} value={province}>
                                  {province.replace(/_/g, ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tour Images</FormLabel>
                        <FormControl>
                          <MultiImageUploader
                            images={field.value || []}
                            onChange={(urls) => field.onChange(urls)}
                            maxImages={5}
                          />
                        </FormControl>
                        <FormDescription>
                          Upload up to 5 images for your tour. The first image will be used as the cover.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6 pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (USD)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (days)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" step="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="maxCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Capacity</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" step="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startDates"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available Start Dates</FormLabel>
                          <FormControl>
                            <DatePicker dates={field.value || []} onDatesChange={(dates) => field.onChange(dates)} />
                          </FormControl>
                          <FormDescription>Select available dates when this tour can start</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="includes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What's Included</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List what's included in the tour price"
                            className="min-h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>E.g., accommodation, meals, transportation, guide</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="excludes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What's Excluded</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List what's not included in the tour price"
                            className="min-h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>E.g., flights, visa fees, personal expenses</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="itinerary" className="space-y-6 pt-4">
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="itinerary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tour Itinerary</FormLabel>
                      <FormControl>
                        <ItineraryEditor
                          value={field.value || ""}
                          onChange={field.onChange}
                          days={form.watch("duration")}
                        />
                      </FormControl>
                      <FormDescription>Create a day-by-day itinerary for your tour</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push("/agency/tours")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : tour ? "Update Tour" : "Create Tour"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
