'use client'
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { getEventsByMonth } from '@/api/event'; // Adjust import path as needed
import Pagination from '../ui/pagination'; // Adjust import path as needed

// Define types based on your API response
interface Event {
  id: number;
  name: string;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function EventList() {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('en-US', { month: 'short' });
  const currentYear = currentDate.getFullYear();
  
  const [activeMonth, setActiveMonth] = useState(currentMonth);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Convert month name to number
  const getMonthNumber = (monthName: string): number => {
    return months.indexOf(monthName) + 1;
  };

  // Fetch events function
  const fetchEvents = async (month: string, page: number = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const monthNumber = getMonthNumber(month);
      const response = await getEventsByMonth(monthNumber, currentYear, {
        page,
        limit: 6, // Adjust based on your grid layout preference
      });
      
      setEvents(response.data);
      
      // Calculate hasNextPage and hasPreviousPage from pagination data
      const hasNextPage = response.pagination.page < response.pagination.totalPages;
      const hasPreviousPage = response.pagination.page > 1;
      
      setPaginationMeta({
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.total,
        hasNextPage,
        hasPreviousPage
      });
      setCurrentPage(response.pagination.page);
    } catch (err) {
      setError('Failed to load events. Please try again.');
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch events when month changes
  useEffect(() => {
    fetchEvents(activeMonth, 1);
  }, [activeMonth]);

  // Handle month change
  const handleMonthChange = (month: string) => {
    setActiveMonth(month);
    setCurrentPage(1); // Reset to first page when changing month
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchEvents(activeMonth, page);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Head>
        <title>What's on in Vietnam</title>
        <meta name="description" content="Check out upcoming events in Vietnam" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold text-cyan-400 mb-2">What's on</h1>
        <p className="text-2xl text-gray-800">Check out upcoming events in Vietnam</p>
      </header>

      {/* Month Selector */}
      <div className="bg-cyan-50 rounded-lg p-6 mb-12">
        <div className="flex justify-between mb-4">
          {months.map((month) => (
            <button
              key={month}
              className={`rounded-lg px-4 py-2 transition-colors ${
                activeMonth === month 
                  ? 'bg-cyan-400 text-white' 
                  : 'bg-cyan-300 text-white hover:bg-cyan-400'
              }`}
              onClick={() => handleMonthChange(month)}
              disabled={isLoading}
            >
              {month}
            </button>
          ))}
        </div>

        {/* Timeline dots */}
        <div className="relative flex items-center justify-between mt-2 px-6">
          <div className="absolute h-0.5 bg-cyan-200 w-full"></div>
          {months.map((month) => (
            <div 
              key={`dot-${month}`}
              className={`w-4 h-4 rounded-full z-10 ${
                activeMonth === month 
                  ? 'bg-cyan-400 border-2 border-white' 
                  : 'bg-white border-2 border-cyan-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400 mr-3"></div>
            <span className="text-gray-600">Loading events...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => fetchEvents(activeMonth, currentPage)}
              className="mt-2 text-red-800 hover:text-red-900 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Events Grid */}
      {!isLoading && !error && (
        <>
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-lg overflow-hidden shadow-md">
                  <div className="h-64 relative">
                    <div className="w-full h-full bg-blue-600 relative">
                      <Image 
                        src={event.coverImage} 
                        alt={event.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-2xl font-bold mb-2">{event.name}</h3>
                    <p className="text-gray-500 text-sm mb-2">
                      {new Date(event.startDate).toLocaleDateString('en-GB', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })} - 
                      {
                        new Date(event.endDate).toLocaleTimeString('en-GB', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })
                      }
                    </p> 
                    <div
                      className="text-gray-600 mb-4 line-clamp-3 overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: event.description }}
                    />
                    <div className="text-right">
                      <button className="text-gray-800 hover:text-cyan-600 transition-colors">
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No events found for {activeMonth}.</p>
            </div>
          )}

          {/* Pagination */}
          {paginationMeta.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={paginationMeta.totalPages}
              hasNextPage={paginationMeta.hasNextPage}
              hasPreviousPage={paginationMeta.hasPreviousPage}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          )}
        </>
      )}
    </div>
  );
}