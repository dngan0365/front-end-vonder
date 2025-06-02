'use client'

import { updateTrip, getTripById, addParticipant, removeParticipant } from '@/api/trip'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, UserPlus } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as z from 'zod'
import ParticipantsSelector from '@/components/ParticipantsSelector'
import { useAuth } from '@/context/AuthContext'
import { useTrip } from '@/hooks/useTrip'
import { Trip, TripParticipant } from '@/api/trip'

// Schema for form validation
const tripFormSchema = z.object({
  name: z.string().min(3, 'Trip name must be at least 3 characters'),
  description: z.string().optional(),
  locationId: z.string().min(1, 'Location is required'),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  hotelName: z.string().optional(),
  hotelAddress: z.string().optional(),
}).refine(data => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

type TripFormValues = z.infer<typeof tripFormSchema>

interface Participant {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

export default function EditTripPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [originalParticipants, setOriginalParticipants] = useState<Participant[]>([])
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { fetchTrips } = useTrip()
  
  const tripId = params?.id as string

  // Initialize the form
  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
  })

  // Load trip data on component mount
  useEffect(() => {
    const loadTripData = async () => {
      if (!tripId) return
      
      try {
        setIsLoading(true)
        const tripData = await getTripById(tripId)
        setTrip(tripData)
        
        // Convert participants to the format we need
        const participantsList: Participant[] = tripData.participants?.map((tp: TripParticipant) => ({
          id: tp.userId,
          name: tp.user?.name,
          email: tp.user?.email,
          image: tp.user?.image,
        })) || []
        
        setParticipants(participantsList)
        setOriginalParticipants([...participantsList]) // Keep a copy for comparison
        
        // Set form values
        form.reset({
          name: tripData.name || '',
          description: tripData.description || '',
          locationId: tripData.locationId,
          startDate: new Date(tripData.startDate),
          endDate: new Date(tripData.endDate),
          hotelName: tripData.hotelName || '',
          hotelAddress: tripData.hotelAddress || '',
        })
      } catch (error) {
        console.error('Failed to load trip:', error)
        toast.error('Failed to load trip data')
        router.push('/profile')
      } finally {
        setIsLoading(false)
      }
    }

    loadTripData()
  }, [tripId, form, router])

  // Handle adding a participant
  const handleAddParticipant = (participant: Participant) => {
    // Don't add if already in the list
    if (!participants.some(p => p.id === participant.id)) {
      setParticipants(prev => [...prev, participant])
    }
  }

  // Handle removing a participant
  const handleRemoveParticipant = (participantId: string) => {
    // Prevent removing yourself
    if (participantId === user?.id) {
      toast.info("You can't remove yourself from the trip")
      return
    }
    setParticipants(prev => prev.filter(p => p.id !== participantId))
  }

  // Compare participants and return changes
  const getParticipantChanges = () => {
    const originalIds = new Set(originalParticipants.map(p => p.id))
    const currentIds = new Set(participants.map(p => p.id))
    
    const toAdd = participants.filter(p => !originalIds.has(p.id))
    const toRemove = originalParticipants.filter(p => !currentIds.has(p.id))
    
    return { toAdd, toRemove }
  }

  // Handle form submission
  const onSubmit = async (values: TripFormValues) => {
    if (!trip) return
    
    try {
      setIsSubmitting(true)
      
      // Update the trip
      const updatedTrip = await updateTrip(trip.id, values)
      
      // Handle participant changes
      const { toAdd, toRemove } = getParticipantChanges()
      
      // Add new participants
      await Promise.all(
        toAdd.map(participant => addParticipant(trip.id, participant.id))
      )
      
      // Remove participants
      await Promise.all(
        toRemove.map(participant => removeParticipant(trip.id, participant.id))
      )
      
      toast.success('Trip updated successfully!')
      fetchTrips()
      
      router.push('/profile') // Redirect to trips list page
    } catch (error) {
      console.error('Failed to update trip:', error)
      toast.error('Failed to update trip. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-10 items-center mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading trip details...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="container max-w-3xl py-10 items-center mx-auto">
        <Card>
          <CardContent className="text-center py-10">
            <p>Trip not found</p>
            <Button onClick={() => router.push('/profile')} className="mt-4">
              Back to Trips
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl py-10 items-center mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Trip</CardTitle>
          <CardDescription>
            Update your trip to {trip.location?.name || 'your destination'}.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trip Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a name for your trip" {...field} />
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
                      <Textarea 
                        placeholder="Describe your trip plans..." 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>Optional details about your trip</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => 
                              date < new Date() || 
                              (form.getValues("startDate") && date < form.getValues("startDate"))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="hotelName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hotel Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Where will you be staying?" {...field} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hotelAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hotel Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Address of your accommodation" {...field} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Add participants section */}
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Trip Participants
                </FormLabel>
                <FormControl>
                  <ParticipantsSelector 
                    selectedParticipants={participants}
                    onParticipantAdd={handleAddParticipant}
                    onParticipantRemove={handleRemoveParticipant}
                  />
                </FormControl>
              </FormItem>
              
              {/* Hidden field for locationId */}
              <input type="hidden" {...form.register('locationId')} />
              
              <CardFooter className="flex justify-between px-0 pt-5">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update Trip
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}