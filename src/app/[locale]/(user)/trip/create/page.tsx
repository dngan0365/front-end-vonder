'use client'

import { createTrip, addParticipant } from '@/api/trip'
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
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as z from 'zod'
import ParticipantsSelector from '@/components/ParticipantsSelector'
import { useAuth } from '@/context/AuthContext'
import { useTrip } from '@/hooks/useTrip'

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
  }).refine(date => date > new Date(), {
    message: 'End date must be in the future',
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

export default function CreateTripPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [participants, setParticipants] = useState<Participant[]>([])
  const { user } = useAuth();
  
  const locationId = searchParams.get('locationId') || ''
  const locationName = searchParams.get('locationName') || ''
  const {fetchTrips} = useTrip();

  // Add current user as default participant when component mounts
  useEffect(() => {
    if (user) {
      const currentUser: Participant = {
        id: user.id,
        name: user.name || undefined,
        email: user.email || undefined,
        image: user.image || undefined,
      }
      setParticipants([currentUser])
    }
  }, [user])

  // Default form values from URL params
  const defaultValues: Partial<TripFormValues> = {
    name: locationName ? `Trip to ${locationName}` : '',
    locationId,
    description: '',
    hotelName: '',
    hotelAddress: '',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to one week from now
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default to two weeks from now
  }

  // Initialize the form
  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues,
  })

  // Handle adding a participant
  const handleAddParticipant = (participant: Participant) => {
    // Don't add if already in the list
    if (!participants.some(p => p.id === participant.id)) {
      setParticipants(prev => [...prev, participant]);
    }
  };

  // Handle removing a participant
  const handleRemoveParticipant = (participantId: string) => {
    // Prevent removing yourself
    if (participantId === user?.id) {
      toast.info("You can't remove yourself from the trip");
      return;
    }
    setParticipants(prev => prev.filter(p => p.id !== participantId));
  };

  // Handle form submission
  const onSubmit = async (values: TripFormValues) => {
    try {
      setIsSubmitting(true)
      // Create the trip
      const newTrip = await createTrip(values)
      
      // Ensure current user is included in participants if array is empty
      const participantsToAdd = participants.length > 0 
        ? participants 
        : user 
          ? [{ 
              id: user.id, 
              name: user.name || undefined,
              email: user.email || undefined,
              image: user.image || undefined
            }] 
          : [];
      
      // Add participants
      await Promise.all(participantsToAdd.map(participant => 
        addParticipant(newTrip.id, participant.id)
      ));
      
      toast.success('Trip created!')
      fetchTrips()
      
      router.push('/trips') // Redirect to trips list page
    } catch (error) {
      console.error('Failed to create trip:', error)
      
      toast.error('Failed to create trip. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-3xl py-10 items-center mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Trip</CardTitle>
          <CardDescription>
            Plan your next adventure to {locationName || 'your favorite destination'}.
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
                  Create Trip
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
