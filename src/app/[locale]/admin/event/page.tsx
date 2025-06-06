'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { deleteEvent, getAllEvents, getEventsByMonth } from '@/api/event';
import type { Event, PaginatedResponse } from '@/api/event';
import { toast } from 'react-toastify'
import { format } from 'date-fns';
import Pagination from '@/components/ui/pagination'; // Adjust import path as needed

export default function AdminEvents() {
  const t = useTranslations('Admin');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [itemsPerPage] = useState(10); // You can make this configurable
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Generate year options (current year and a few years back/forward)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  
  const monthOptions = [
    { value: '', label: t('all_months') },
    { value: '1', label: t('month_1') },
    { value: '2', label: t('month_2') },
    { value: '3', label: t('month_3') },
    { value: '4', label: t('month_4') },
    { value: '5', label: t('month_5') },
    { value: '6', label: t('month_6') },
    { value: '7', label: t('month_7') },
    { value: '8', label: t('month_8') },
    { value: '9', label: t('month_9') },
    { value: '10', label: t('month_10') },
    { value: '11', label: t('month_11') },
    { value: '12', label: t('month_12') },
  ];

  useEffect(() => {
    fetchEvents(currentPage);
  }, [refreshTrigger, currentPage, debouncedSearchTerm, selectedMonth, selectedYear]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when search criteria change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, selectedMonth, selectedYear]);

  const fetchEvents = async (page: number = 1) => {
    setIsLoading(true);
    try {
      let response: PaginatedResponse<Event>;

      // Use the appropriate API endpoint based on filters
      if (selectedMonth && selectedYear) {
        // Use getEventsByMonth when both month and year are selected
        response = await getEventsByMonth(
          parseInt(selectedMonth), 
          parseInt(selectedYear), 
          {
            page,
            limit: itemsPerPage,
            search: debouncedSearchTerm
          }
        );
      } else {
        // Use getAllEvents for general search and pagination
        response = await getAllEvents({
          page,
          limit: itemsPerPage,
          search: debouncedSearchTerm
        });
      }
      
      console.log(response);
      setEvents(response.data);
      
      // Update pagination metadata using the response structure
      setPaginationMeta({
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems,
        hasNextPage: response.pagination.hasNextPage,
        hasPreviousPage: response.pagination.hasPreviousPage
      });
      setCurrentPage(response.pagination.currentPage);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error(t('fetchError') || 'Error fetching events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (confirm(t('confirmDelete') || 'Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id);
        
        // Check if we need to go back a page after deletion
        const remainingItemsOnCurrentPage = events.length - 1;
        const shouldGoToPreviousPage = remainingItemsOnCurrentPage === 0 && currentPage > 1;
        
        if (shouldGoToPreviousPage) {
          setCurrentPage(prev => prev - 1);
        } else {
          setRefreshTrigger(prev => prev + 1);
        }
        
        toast.success(t('eventDeleted') || 'Event deleted successfully');
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error(t('deleteError') || 'Error deleting event. Please try again.');
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedMonth('');
    setSelectedYear('');
    setCurrentPage(1);
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
        {/* Search and Filter Section */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search by name */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                {t('searchByName') || 'Search by Name'}
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchPlaceholder') || 'Enter event name...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter by month */}
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                {t('filterByMonth') || 'Filter by Month'}
              </label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by year */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                {t('filterByYear') || 'Filter by Year'}
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('allYears') || 'All Years'}</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear filters button */}
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                {t('clearFilters') || 'Clear Filters'}
              </button>
            </div>
          </div>

          {/* Active filters display */}
          {(searchTerm || selectedMonth || selectedYear) && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">{t('activeFilters') || 'Active filters'}:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Name: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedMonth && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Month: {monthOptions.find(m => m.value === selectedMonth)?.label}
                  <button
                    onClick={() => setSelectedMonth('')}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedYear && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Year: {selectedYear}
                  <button
                    onClick={() => setSelectedYear('')}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('name') || 'Name'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('startDate') || 'Start Date'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('endDate') || 'End Date'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('actions') || 'Actions'}
                    </th>
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
                        <Link 
                          href={`/admin/event/${event.id}`} 
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
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

            {/* Pagination */}
            {paginationMeta.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={paginationMeta.totalPages}
                  hasNextPage={paginationMeta.hasNextPage}
                  hasPreviousPage={paginationMeta.hasPreviousPage}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Results summary */}
            {paginationMeta.totalItems > 0 && (
              <div className="mt-4 text-sm text-gray-600 text-center">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, paginationMeta.totalItems)} to{' '}
                {Math.min(currentPage * itemsPerPage, paginationMeta.totalItems)} of{' '}
                {paginationMeta.totalItems} {paginationMeta.totalItems === 1 ? 'event' : 'events'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}