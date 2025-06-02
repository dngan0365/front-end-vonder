'use client'
import React, { useState, useEffect, useCallback } from 'react';
import CategoriesSidebar from '@/components/sidebar/CategoriesSidebar';
import { getAllLocations, searchLocations, PaginatedResponse, Location } from '@/api/location';
import { getAllEvents, searchEvents, Event } from '@/api/event';
import EventList from '@/components/eventlist/EventList';
import LocationItem from '@/components/LocationItem';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

type ContentType = 'locations' | 'events';

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // State management
  const [contentType, setContentType] = useState<ContentType>('locations');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [locations, setLocations] = useState<Location[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch content function
  const fetchContent = useCallback(async (
    page: number = 1, 
    category: string = activeCategory, 
    search: string = searchTerm,
    type: ContentType = contentType
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let response: PaginatedResponse<Location | Event>;
      
      if (search.trim()) {
        setIsSearching(true);
        if (type === 'locations') {
          // Fixed: Pass parameters correctly to searchLocations
          response = await searchLocations(search, { 
            page, 
            limit: 10, 
            category: category !== 'all' ? category : undefined 
          }) as PaginatedResponse<Location>;
          setLocations(response.data as Location[]);
        } else {
          // Fixed: Pass parameters correctly to searchEvents
          response = await searchEvents(search, { page, limit: 10 }) as PaginatedResponse<Event>;
          setEvents(response.data as Event[]);
        }
      } else {
        setIsSearching(false);
        if (type === 'locations') {
          // Fixed: Pass parameters as object to getAllLocations
          response = await getAllLocations({ 
            page, 
            limit: 10, 
            category: category !== 'all' ? category : undefined 
          }) as PaginatedResponse<Location>;
          setLocations(response.data as Location[]);
        } else {
          // Events API call - assuming it takes similar parameters
          response = await getAllEvents({ page, limit: 10 }) as PaginatedResponse<Event>;
          setEvents(response.data as Event[]);
        }
      }
      
      setPagination(response.pagination);
    } catch (err) {
      setError(`Failed to fetch ${type}. Please try again.`);
      console.error(`Error fetching ${type}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, searchTerm, contentType]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchContent(1, category, searchTerm, contentType);
  };

  // Handle content type change
  const handleContentTypeChange = (type: ContentType) => {
    setContentType(type);
    setActiveCategory(type === 'events' ? 'all' : 'all');
    setSearchTerm('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchContent(1, 'all', '', type);
  };

  // Handle search with debouncing
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      fetchContent(1, activeCategory, term, contentType);
    }, 500); // 500ms debounce
    
    setSearchTimeout(timeout);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }));
      fetchContent(page, activeCategory, searchTerm, contentType);
    }
  };

  // Fixed: Load more function for infinite scroll
  const loadMore = async () => {
    if (pagination.hasNextPage && !isLoading) {
      const nextPage = pagination.currentPage + 1;
      setIsLoading(true);
      
      try {
        let response: PaginatedResponse<Location | Event>;
        
        if (searchTerm.trim()) {
          if (contentType === 'locations') {
            response = await searchLocations(searchTerm, { 
              page: nextPage, 
              limit: 10, 
              category: activeCategory !== 'all' ? activeCategory : undefined 
            }) as PaginatedResponse<Location>;
            setLocations(prev => [...prev, ...(response.data as Location[])]);
          } else {
            response = await searchEvents(searchTerm, { page: nextPage, limit: 10 }) as PaginatedResponse<Event>;
            setEvents(prev => [...prev, ...(response.data as Event[])]);
          }
        } else {
          if (contentType === 'locations') {
            response = await getAllLocations({ 
              page: nextPage, 
              limit: 10, 
              category: activeCategory !== 'all' ? activeCategory : undefined 
            }) as PaginatedResponse<Location>;
            setLocations(prev => [...prev, ...(response.data as Location[])]);
          } else {
            response = await getAllEvents({ page: nextPage, limit: 10 }) as PaginatedResponse<Event>;
            setEvents(prev => [...prev, ...(response.data as Event[])]);
          }
        }
        
        setPagination(response.pagination);
      } catch (err) {
        setError(`Failed to load more ${contentType}. Please try again.`);
        console.error(`Error loading more ${contentType}:`, err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    fetchContent(1, 'all', '', 'locations');
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const currentData = contentType === 'locations' ? locations : events;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar - sticky */}
        <div className="md:sticky md:top-8 md:self-start md:w-64 md:flex-shrink-0">
          <CategoriesSidebar 
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            contentType={contentType}
            onContentTypeChange={handleContentTypeChange}
            isLoading={isLoading}
          />
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${contentType}...`}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
              {searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p>{error}</p>
              <button 
                onClick={() => fetchContent(pagination.currentPage, activeCategory, searchTerm, contentType)}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Content Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 capitalize">
              {isSearching ? (
                `Search Results for "${searchTerm}"`
              ) : contentType === 'locations' ? (
                activeCategory === 'all' ? 'All Locations' : `${activeCategory} Locations`
              ) : (
                'All Events'
              )}
            </h1>
            <p className="text-gray-600 mt-2">
              {isLoading ? 'Loading...' : (
                <>
                  Found {pagination.totalItems} {contentType} 
                  {pagination.totalPages > 1 && (
                    <span className="ml-2">
                      (Page {pagination.currentPage} of {pagination.totalPages})
                    </span>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            </div>
          )}

          {/* Content Rendering */}
          {!isLoading && !error && (
            <>
              {contentType === 'events' ? (
                <EventList events={events} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(currentData as Location[]).map((location) => (
                    <LocationItem 
                      key={location.id} 
                      location={location}
                      isFavorite={false} // You can implement favorite logic here
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {!isLoading && !error && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const startPage = Math.max(1, pagination.currentPage - 2);
                const pageNumber = startPage + i;
                
                if (pageNumber <= pagination.totalPages) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-4 py-2 border rounded-md ${
                        pageNumber === pagination.currentPage
                          ? 'bg-cyan-500 text-white border-cyan-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && currentData.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                {contentType === 'locations' ? '🏞️' : '🎪'}
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No {contentType} found
              </h3>
              <p className="text-gray-500">
                {isSearching ? (
                  `No ${contentType} match your search "${searchTerm}"`
                ) : (
                  `No ${contentType} available${contentType === 'locations' && activeCategory !== 'all' ? ` for the ${activeCategory} category` : ''}.`
                )}
              </p>
              {isSearching && (
                <button
                  onClick={() => handleSearch('')}
                  className="mt-4 px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Render children if needed */}
          {children}
        </div>
      </div>
    </div>
  );
}