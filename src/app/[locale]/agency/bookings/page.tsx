'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getToursByAgency, Tour } from '@/api/tour'
import { BookingStatus, getTourBookingsByTourId, TourBooking, updateBookingStatus } from '@/api/tourBooking'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

// Interface to represent bookings organized by tour
interface TourWithBookings extends Tour {
  bookings: TourBooking[];
}

export default function AgencyBookingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [toursWithBookings, setToursWithBookings] = useState<TourWithBookings[]>([])
  const [statusUpdating, setStatusUpdating] = useState<Record<string, boolean>>({})
  const [selectedStatus, setSelectedStatus] = useState('ALL')

  // Flatten all bookings for status filtering
  const allBookings = useMemo(() => {
    return toursWithBookings.flatMap(tour => tour.bookings)
  }, [toursWithBookings])

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.id) return
      
      try {
        setLoading(true)
        const agencyTours = await getToursByAgency(user.id)
        
        // Fetch bookings for each tour and organize them
        const toursWithBookingsData = await Promise.all(
          agencyTours.map(async (tour) => {
            const bookings = await getTourBookingsByTourId(tour.id)
            return {
              ...tour,
              bookings
            }
          })
        )
        
        // Sort tours by title
        const sortedTours = toursWithBookingsData.sort((a, b) => 
          a.title.localeCompare(b.title)
        )
        
        setToursWithBookings(sortedTours)
      } catch (error) {
        console.error('Error fetching bookings:', error)
        toast.error('Error fetching bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user?.id])

  const handleStatusUpdate = async (bookingId: string, currentStatus: BookingStatus) => {
    // Don't allow updates for cancelled or completed bookings
    if (['CANCELLED', 'COMPLETED'].includes(currentStatus)) {
      return;
    }
    
    try {
      setStatusUpdating(prev => ({ ...prev, [bookingId]: true }))
      
      // Call the updateBookingStatus function that automatically progresses the status
      const updatedBooking = await updateBookingStatus(bookingId);
      
      // Since the API returns a booking that might not include all the properties
      // we need to merge it carefully with the existing booking data
      setToursWithBookings(prev => {
        return prev.map(tourWithBookings => ({
          ...tourWithBookings,
          bookings: tourWithBookings.bookings.map(booking => {
            if (booking.id === bookingId) {
              // Make sure we preserve all necessary properties
              // by merging the updated booking with the existing one
              return {
                ...booking,
                status: updatedBooking.status || booking.status
              };
            }
            return booking;
          })
        }))
      });
      
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Error updating status');
    } finally {
      setStatusUpdating(prev => ({ ...prev, [bookingId]: false }))
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'CONFIRMED':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Confirmed</Badge>
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Filter tours based on the selected status tab
  const filterToursByStatus = (status: string) => {
    if (status === 'ALL') {
      return toursWithBookings
    }
    
    return toursWithBookings
      .map(tour => ({
        ...tour,
        bookings: tour.bookings.filter(booking => booking.status === status)
      }))
      .filter(tour => tour.bookings.length > 0)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Tour Bookings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Bookings Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="ALL" 
            onValueChange={(value) => setSelectedStatus(value)}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="ALL">
                All 
                <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {allBookings.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="PENDING">
                Pending
                <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {allBookings.filter(b => b.status === 'PENDING').length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="CONFIRMED">
                Confirmed
                <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {allBookings.filter(b => b.status === 'CONFIRMED').length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="CANCELLED">
                Cancelled
                <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {allBookings.filter(b => b.status === 'CANCELLED').length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="COMPLETED">
                Completed
                <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {allBookings.filter(b => b.status === 'COMPLETED').length}
                </span>
              </TabsTrigger>
            </TabsList>
            
            {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map(status => (
              <TabsContent key={status} value={status}>
                {filterToursByStatus(status).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No bookings found.
                  </div>
                ) : (
                  <Accordion type="multiple" className="w-full">
                    {filterToursByStatus(status).map((tourWithBookings) => (
                      <AccordionItem key={tourWithBookings.id} value={tourWithBookings.id}>
                        <AccordionTrigger className="hover:bg-gray-50 px-4 py-2 rounded-md">
                          <div className="flex items-center justify-between w-full">
                            <div className="font-medium text-lg">{tourWithBookings.title}</div>
                            <div className="text-sm text-gray-500">
                              {tourWithBookings.bookings.length} booking{tourWithBookings.bookings.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="overflow-x-auto p-2">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Customer</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Participants</TableHead>
                                  <TableHead>Total Price</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {tourWithBookings.bookings.map((booking) => (
                                  <TableRow key={booking.id}>
                                    <TableCell className="font-medium">{booking.user.name}</TableCell>
                                    <TableCell>{format(new Date(booking.bookingDate), 'PP')}</TableCell>
                                    <TableCell>{booking.participants}</TableCell>
                                    <TableCell>${booking.totalPrice.toFixed(2)}</TableCell>
                                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                    <TableCell>
                                      {!['CANCELLED', 'COMPLETED'].includes(booking.status) ? (
                                        <div className="flex items-center">
                                          <button
                                            onClick={() => handleStatusUpdate(booking.id, booking.status)}
                                            disabled={statusUpdating[booking.id]}
                                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none disabled:opacity-50"
                                          >
                                            Update status
                                          </button>
                                          {statusUpdating[booking.id] && (
                                            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-gray-500">
                                          {booking.status === 'CANCELLED' ? 'Cannot update cancelled booking' : 'Booking completed'}
                                        </span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
