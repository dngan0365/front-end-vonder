'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getEventById, updateEvent } from '@/api/event';
import data from '@/data/data.json';
import ImageUploader from '@/components/ImageUploader';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Form,
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'react-toastify'; // Update the path to the correct module
import { cn } from '@/lib/utils';
import type { Event} from '@/api/event';

const TinyMCEEditor = dynamic(() => import('@/components/TinymceEditor'), { ssr: false });

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  coverImage: z.string().min(1, 'Cover image is required'),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  })
}).refine(data => data.endDate >= data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
});

export default function EditEvent({ params }: { params: { id: string } }) {
  const t = useTranslations('Admin');
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Setup React Hook Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      coverImage: '',
      startDate: undefined,
      endDate: undefined
    }
  });
  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Fetch event data using the API
        const eventData = await getEventById(params.id);
        setEvent(eventData);
        
        // Parse dates properly
        const startDate = eventData.startDate ? new Date(eventData.startDate) : undefined;
        const endDate = eventData.endDate ? new Date(eventData.endDate) : undefined;
        
        // Set form data from fetched event
        form.reset({
          name: eventData.name,
          description: eventData.description,
          startDate,
          endDate,
          coverImage: eventData.coverImage || ''
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event data');
        setIsLoading(false);
      }
    };
    
    fetchEvent();
  }, [params.id, form]);
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await updateEvent(params.id, data);
      
      toast.success(t('eventUpdated') || 'Event updated successfully!');
      
      router.push('/admin/event');
    } catch (err) {
      setError('Failed to update event. Please try again.');
      console.error('Error updating event:', err);
      
      toast.error('Failed to update event. Please try again.', {
        autoClose: 5000,
      });
    }
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (!event) {
    return <div className="text-center text-red-500 p-4">Event not found</div>;
  }
}
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('editEvent') || 'Edit Event'}</h1>
        <Link href="/admin/event" className="text-blue-600 hover:underline">
          {t('backToList') || 'Back to list'}
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('name') || 'Name'}*</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </FormControl>
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
                      <FormLabel>{t('startDate') || 'Start Date'}*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-gray-400"
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
                      <FormLabel>{t('endDate') || 'End Date'}*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-gray-400"
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
                            disabled={(date) => {
                              const startDate = form.getValues("startDate");
                              return startDate ? date < startDate : false;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('description') || 'Description'}*</FormLabel>
                  <FormControl>
                    <TinyMCEEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('coverImage') || 'Cover Image'}*</FormLabel>
                  <FormControl>
                    <ImageUploader
                      currentImage={field.value}
                      onImageChange={field.onChange}
                      label={t('coverImage') || 'Cover Image'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          
            <div className="flex gap-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {t('saveChanges') || 'Save Changes'}
              </Button>
              <Link href="/admin/event" passHref>
                <Button variant="outline" className="bg-gray-200 text-gray-800 hover:bg-gray-300">
                  {t('cancel') || 'Cancel'}
                </Button>
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
  }