'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBookingById, cancelTourBooking, TourBooking } from '@/api/tourBooking';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Pencil, FileText, DollarSign } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@/context/AuthContext';

export default function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<TourBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchBooking = async () => {
      if (authLoading) {
        return; // Wait for auth loading to finish
      }
      if (!id || !user?.id) {
        if (!user?.id) {
          setLoading(false);
          toast.error('Authentication failed. Please login again.');
          router.push('/auth/login');
          return;
        }
        
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching booking with ID:', id, 'User ID:', user.id);
        const data = await getBookingById(id as string, user.id);
        setBooking(data);
      } catch (error) {
        console.error('Error fetching booking details:', error);
        toast.error('Could not load booking details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, user?.id]);

  const handleCancel = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to cancel a booking');
      return;
    }
    
    try {
      setCancelling(true);
      await cancelTourBooking(id as string, user.id);
      toast.success('Your booking has been successfully cancelled.');
      const updatedBooking = await getBookingById(id as string, user.id);
      setBooking(updatedBooking);
      setCancelDialogOpen(false);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Could not cancel booking. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3">Loading booking details...</p>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">Please login to view your booking details.</p>
          <Button onClick={() => router.push('/login')}>Login</Button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
          <p className="mb-4">The booking you are looking for does not exist or you do not have permission to view it.</p>
          <Button onClick={() => router.push('/bookings')}>Back to Bookings</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          ← Back to Bookings
        </Button>
        <h1 className="text-3xl font-bold">Booking Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Booking Info */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Booking Information</CardTitle>
            <Badge className={`${getStatusBadgeColor(booking.status)} px-3 py-1 text-sm font-medium rounded-full`}>
              {booking.status}
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-500 mb-1">Booking ID</h3>
                <p className="font-mono text-sm">{booking.id}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500 mb-1">Date Created</h3>
                <p>{format(new Date(booking.createdAt), 'PPP')}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">Tour Date</h3>
                  <p>{format(new Date(booking.bookingDate), 'PPP')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">Participants</h3>
                  <p>{booking.participants} {booking.participants === 1 ? 'person' : 'people'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">Total Price</h3>
                  <p className="font-semibold text-xl">${booking.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {booking.notes && (
              <div className="border-t pt-4">
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Notes</h3>
                    <p className="text-gray-700">{booking.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
              <>
                <Button variant="outline" onClick={() => router.push(`/bookings/${id}/edit`)}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit Booking
                </Button>
                <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Cancel Booking</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Booking</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel this booking? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Go Back</Button>
                      <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
                        {cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
            
            {booking.status === 'COMPLETED' && (
              <Link href={`/tours/${booking.tourId}/review`} passHref>
                <Button>Write a Review</Button>
              </Link>
            )}
            
            {booking.status === 'CANCELLED' && (
              <p className="text-gray-500 italic">This booking has been cancelled</p>
            )}
          </CardFooter>
        </Card>

        {/* Tour Information */}
        {booking.tour && (
          <Card>
            <CardHeader>
              <CardTitle>Tour Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {booking.tour.images[0] && (
                <div className="relative h-48 w-full overflow-hidden rounded-md">
                  <Image 
                    src={booking.tour.images[0]} 
                    alt={booking.tour.title} 
                    fill 
                    className="object-cover"
                  />
                </div>
              )}
              
              <h3 className="font-bold text-xl">{booking.tour.title}</h3>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>
                  {booking.tour.duration} 'days'
                </span>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-3">
                {booking.tour.description || 'No description provided.'}
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/travel/${booking.tourId}`} passHref>
                <Button variant="outline" className="w-full">
                  View Tour Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
