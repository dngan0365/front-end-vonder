"use client";

import { useEffect, useState } from 'react';
import { getUserBookings, TourBooking, BookingStatus } from '@/api/tourBooking';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Filter, Calendar, Users, Info, FileText, Clock } from "lucide-react";
import { useAuth } from '@/context/AuthContext';

export default function BookingsPage() {
  const {user} = useAuth();
  const [bookings, setBookings] = useState<TourBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const userBookings = await getUserBookings(user.id);
        setBookings(userBookings);
        setError(null);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load your bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user?.id]);
  
  const filteredBookings = bookings.filter(booking => 
    filter === 'ALL' || booking.status === filter
  );
  
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
    } else {
      return b.totalPrice - a.totalPrice;
    }
  });
  
  const getStatusBadge = (status: BookingStatus) => {
    switch(status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'CONFIRMED':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Confirmed</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Cancelled</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading your bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => {
              if (user?.id) getUserBookings(user.id)
                .then(setBookings)
                .catch(err => setError('Failed to reload bookings.'))
                .finally(() => setLoading(false));
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h4 className="text-xl font-bold tracking-tight">Your Bookings</h4>
        </div>
        
        <Link href="/travel">
          <Button className="mt-4 sm:mt-0">Book New Tour</Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-10 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Filter by status:</p>
              <Select value={filter} onValueChange={(value) => setFilter(value as BookingStatus | 'ALL')}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Sort by:</p>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'price')}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Booking Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Booking Date</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Showing {sortedBookings.length} bookings
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {renderBookingsList(sortedBookings)}
          </TabsContent>
          
          <TabsContent value="upcoming">
            {renderBookingsList(sortedBookings.filter(b => 
              b.status === 'CONFIRMED' 
            ))}
          </TabsContent>
          
          <TabsContent value="past">
            {renderBookingsList(sortedBookings.filter(b => 
              b.status === 'COMPLETED' 
            ))}
          </TabsContent>
          
          <TabsContent value="cancelled">
            {renderBookingsList(sortedBookings.filter(b => b.status === 'CANCELLED'))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
  
  function renderBookingsList(bookings: TourBooking[]) {
    if (bookings.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No bookings found</p>
        </div>
      );
    }
    
    return (
      <div className="grid gap-6">
        {bookings.map((booking) => (
          <Card key={booking.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/4 bg-slate-50 p-6 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Booking ID</p>
                  <p className="font-mono text-sm mb-4">{booking.id.substring(0, 8)}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Tour Date</p>
                        <p className="text-sm">{format(new Date(booking.bookingDate), 'PPP')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Participants</p>
                        <p className="text-sm">{booking.participants} {booking.participants === 1 ? 'person' : 'people'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium">Status</p>
                  <div className="mt-1">{getStatusBadge(booking.status)}</div>
                </div>
              </div>
              
              <CardContent className="md:w-3/4 p-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">{booking.tour?.title || 'Tour Package'}</CardTitle>
                    <CardDescription className="mb-4 text-base">
                      Booked on {format(new Date(booking.createdAt), 'PP')}
                    </CardDescription>
                    
                    {booking.notes && (
                      <div className="mt-2 bg-slate-50 p-3 rounded-md">
                        <div className="flex items-center gap-1.5 mb-1">
                          <FileText className="h-4 w-4" />
                          <p className="text-sm font-medium">Additional Notes</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{booking.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 md:mt-0 md:text-right">
                    <p className="text-sm text-muted-foreground">Total Price</p>
                    <p className="text-2xl font-bold">${booking.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </div>
            
            <CardFooter className="bg-slate-50 px-6 py-4 flex flex-wrap gap-2 justify-between">
              <div className="flex gap-2">
                <Link href={`/bookings/${booking.id}`}>
                  <Button variant="outline" size="sm">
                    <Info className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                </Link>
                
                {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                  <Link href={`/bookings/${booking.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                )}
              </div>
              
              {booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? (
                <Button variant="destructive" size="sm">Cancel Booking</Button>
              ) : null}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
}
