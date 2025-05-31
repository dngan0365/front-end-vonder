"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  getBookingById, 
  updateTourBooking, 
  TourBooking, 
  BookingStatus,
  UpdateTourBookingInput
} from "@/api/tourBooking";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify"; // <-- Use react-toastify
import "react-toastify/dist/ReactToastify.css";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Form schema for validation
const formSchema = z.object({
  participants: z.number().int().min(1, {
    message: "You must have at least 1 participant",
  }),
  notes: z.string().optional(),
});

export default function EditBookingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user  } = useAuth();
  const [booking, setBooking] = useState<TourBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      participants: 1,
      notes: "",
    },
  });

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const bookingData = await getBookingById(params.id, user.id);
        setBooking(bookingData);
        
        // Set form values based on the booking data
        form.reset({
          participants: bookingData.participants,
          notes: bookingData.notes || "",
        });
        
        setError(null);
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError("Failed to load booking details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [params.id, user?.id, form]);

  // Check if user is allowed to edit this booking
  const canEditStatus = user?.id === booking?.userId;
  const canUpdateBooking = 
    booking?.status === "PENDING" || 
    booking?.status === "CONFIRMED";

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id || !booking) return;
    
    try {
      setUpdating(true);
      
      const updateData: UpdateTourBookingInput = {
        participants: values.participants,
        notes: values.notes,
      };
      
      // Only allow status change from PENDING to CANCELLED by user
      if (!canEditStatus && updateData.status !== "CANCELLED") {
        delete updateData.status;
      }
      
      const updatedBooking = await updateTourBooking(
        booking.id,
        user.id,
        updateData
      );
      
      setBooking(updatedBooking);
      toast.success("Booking updated successfully");
      
      // Redirect to booking details page after successful update
      router.push(`/bookings/${booking.id}`);
      router.refresh();
    } catch (err) {
      console.error("Error updating booking:", err);
      toast.error("Failed to update booking. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 size={32} />
        <span className="ml-2">Loading booking details...</span>
        <ToastContainer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || "Booking not found"}</p>
          <Link href="/bookings">
            <Button variant="outline" className="mt-2">
              Return to Bookings
            </Button>
          </Link>
        </div>
        <ToastContainer />
      </div>
    );
  }

  // If booking is not editable anymore, show message and redirect
  if (!canUpdateBooking) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <h2 className="text-lg font-medium mb-2">This booking cannot be edited</h2>
          <p>
            Bookings with status "{booking.status.toLowerCase()}" cannot be modified.
            Only pending or confirmed bookings can be updated.
          </p>
          <Link href={`/bookings/${booking.id}`}>
            <Button variant="outline" className="mt-4">
              View Booking Details
            </Button>
          </Link>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <ToastContainer />
      <div className="mb-6">
        <Link href={`/bookings/${booking.id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Booking Details
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Edit Booking</CardTitle>
              <CardDescription>
                Update details for your booking made on {format(new Date(booking.createdAt), "PPP")}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Booking Information</h3>
                        <div className="bg-slate-50 p-4 rounded-md">
                          <p className="text-sm text-muted-foreground mb-1">Booking ID</p>
                          <p className="font-mono text-sm mb-3">{booking.id}</p>
                          
                          <p className="text-sm text-muted-foreground mb-1">Tour</p>
                          <p className="font-medium mb-3">{booking.tour?.title || "Tour Package"}</p>
                          
                          <p className="text-sm text-muted-foreground mb-1">Current Status</p>
                          <div className="mb-3">
                            <Badge className={cn(
                              booking.status === "PENDING" && "bg-yellow-100 text-yellow-800 border-yellow-300",
                              booking.status === "CONFIRMED" && "bg-green-100 text-green-800 border-green-300",
                              booking.status === "CANCELLED" && "bg-red-100 text-red-800 border-red-300",
                              booking.status === "COMPLETED" && "bg-blue-100 text-blue-800 border-blue-300",
                            )}>
                              {booking.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-1">Total Price</p>
                          <p className="font-medium">${booking.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Tour Date</h3>
                        <div className="bg-slate-50 p-4 rounded-md flex items-center">
                          <CalendarIcon className="h-5 w-5 text-muted-foreground mr-2" />
                          <div>
                            <p className="font-medium">{format(new Date(booking.bookingDate), "PPP")}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Tour date cannot be changed. Please cancel and rebook if needed.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="participants"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Participants</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={1} 
                                {...field} 
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Adjusting participants may change the total price
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Requests or Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Add any special requests or notes for the tour agency"
                                className="resize-y"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Dietary requirements, accessibility needs, etc.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t flex justify-between items-center">
                    <Link href={`/bookings/${booking.id}`}>
                      <Button type="button" variant="outline">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={updating}>
                      {updating ? (
                        <>
                          <Loader2 size={20} className="mr-2" /> Updating...
                        </>
                      ) : (
                        "Update Booking"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md">
                <h4 className="font-medium text-sm mb-2 text-yellow-800">Cancellation Policy</h4>
                <p className="text-sm text-yellow-700">
                  Cancellations made less than 48 hours before the tour date may incur fees.
                  Please review the tour's cancellation policy.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Need Help?</h4>
                <p className="text-sm text-muted-foreground">
                  If you need to make additional changes or have questions about your booking,
                  please contact customer support.
                </p>
                <Button variant="link" className="px-0 py-1 h-auto text-sm">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
