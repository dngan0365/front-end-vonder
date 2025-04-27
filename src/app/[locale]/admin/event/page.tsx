'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { deleteEvent, getAllEvents } from '@/api/event';
import type { Event } from '@/api/event';
import { toast } from 'react-toastify'
import { format } from 'date-fns';

export default function AdminEvents() {
  const t = useTranslations('Admin');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);


  useEffect(() => {
    // Fetch events from the API
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const data = await getAllEvents();
        console.log(data);
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error(t('fetchError') || 'Error fetching events. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, [refreshTrigger]); // Only re-fetch when t changes
  
  const handleDelete = (id: string) => {
    if (confirm(t('confirmDelete') || 'Are you sure you want to delete this event?')) {
      deleteEvent(id)
        .then(() => {
          // Update local state and trigger a refresh
          setEvents(events.filter(event => event.id !== id));
          setRefreshTrigger(prev => prev + 1); // Increment to trigger a refresh
          toast.success(t('eventDeleted') || 'Event deleted successfully');
        })
        .catch((error) => {
          console.error('Error deleting event:', error);
          toast.error(t('deleteError') || 'Error deleting event. Please try again.');
        });
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('eventManagement') || 'Event Management'}</h1>
        <Link 
          href="/admin/event/add-event" 
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
        >
          {t('addEvent') || 'Add Event'}
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name') || 'Name'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('startDate') || 'Start Date'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('endDate') || 'End Date'}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{event.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {event.startDate ? format(new Date(event.startDate), 'PP') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {event.endDate ? format(new Date(event.endDate), 'PP') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/event/${event.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        {t('edit') || 'Edit'}
                      </Link>
                      <button 
                        onClick={() => handleDelete(event.id)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        {t('delete') || 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      {t('noEvents') || 'No events found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}