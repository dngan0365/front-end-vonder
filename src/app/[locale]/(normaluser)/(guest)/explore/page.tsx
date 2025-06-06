'use client'
import React, { useState, useEffect, useCallback } from 'react';
import CategoriesSidebar from '@/components/sidebar/CategoriesSidebar';
import { getAllLocations, searchLocations, PaginatedResponse, Location } from '@/api/location';
import { getAllEvents, searchEvents, Event } from '@/api/event';
import EventList from '@/components/eventlist/eventlist';
import LocationItem from '@/components/LocationItem';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type ContentType = 'locations' | 'events';

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Explore")
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management with URL preservation
  const [contentType, setContentType] = useState<ContentType>(() => {
    return (searchParams.get('type') as ContentType) || 'locations';
  });
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    return searchParams.get('category') || 'all';
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 6,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(() => {
    return searchParams.get('search') || '';
  });
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Helper functions for pagination info
  const hasNextPage = pagination.page < pagination.totalPages;
  const hasPreviousPage = pagination.page > 1;

  // Update URL without causing page reload
  const updateURL = useCallback((params: {
    type?: ContentType;
    category?: string;
    page?: number;
    search?: string;
  }) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (params.type) newParams.set('type', params.type);
    if (params.category) newParams.set('category', params.category);
    if (params.page) newParams.set('page', params.page.toString());
    if (params.search) {
      newParams.set('search', params.search);
    } else {
      newParams.delete('search');
    }
    
    // Use replace to avoid adding to browser history for every filter change
    router.replace(`?${newParams.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Fetch content function
  const fetchContent = useCallback(async (
    page: number = 1, 
    category: string = activeCategory, 
    search: string = searchTerm,
    type: ContentType = contentType,
    replace: boolean = true // New parameter to control if we replace or append data
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let response: PaginatedResponse<Location | Event>;
      
      if (search.trim()) {
        setIsSearching(true);
        if (type === 'locations') {
          response = await searchLocations(search, { 
            page, 
            limit: 6, 
            category: category !== 'all' ? category : undefined 
          }) as PaginatedResponse<Location>;
          
          if (replace) {
            setLocations(response.data as Location[]);
          } else {
            setLocations(prev => [...prev, ...(response.data as Location[])]);
          }
        } else {
          response = await searchEvents(search, { page, limit: 6 }) as PaginatedResponse<Event>;
          
          if (replace) {
            setEvents(response.data as Event[]);
          } else {
            setEvents(prev => [...prev, ...(response.data as Event[])]);
          }
        }
      } else {
        setIsSearching(false);
        if (type === 'locations') {
          response = await getAllLocations({ 
            page, 
            limit: 6, 
            category: category !== 'all' ? category : undefined 
          }) as PaginatedResponse<Location>;
          
          if (replace) {
            setLocations(response.data as Location[]);
          } else {
            setLocations(prev => [...prev, ...(response.data as Location[])]);
          }
        } else {
          response = await getAllEvents({ page, limit: 6 }) as PaginatedResponse<Event>;
          
          if (replace) {
            setEvents(response.data as Event[]);
          } else {
            setEvents(prev => [...prev, ...(response.data as Event[])]);
          }
        }
      }
      
      setPagination(response.pagination);
      
      // Update URL with current state
      updateURL({
        type,
        category,
        page,
        search: search || undefined
      });
      
    } catch (err) {
      setError(`Failed to fetch ${type}. Please try again.`);
      console.error(`Error fetching ${type}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [updateURL]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchContent(1, category, searchTerm, contentType, true);
  };

  // Handle content type change
  const handleContentTypeChange = (type: ContentType) => {
    setContentType(type);
    setActiveCategory(type === 'events' ? 'all' : 'all');
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchContent(1, 'all', '', type, true);
  };

  // Handle search with debouncing
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchContent(1, activeCategory, term, contentType, true);
    }, 500); // 500ms debounce
    
    setSearchTimeout(timeout);
  };

  // Handle pagination - Fixed to properly replace content
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages && !isLoading) {
      // Scroll to top of content area instead of entire page
      const contentArea = document.getElementById('main-content');
      if (contentArea) {
        contentArea.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      setPagination(prev => ({ ...prev, page }));
      fetchContent(page, activeCategory, searchTerm, contentType, true);
    }
  };

  // Load more function for infinite scroll (if needed)
  const loadMore = async () => {
    if (hasNextPage && !isLoading) {
      const nextPage = pagination.page + 1;
      fetchContent(nextPage, activeCategory, searchTerm, contentType, false);
    }
  };

  // Helper function to generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;
    
    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, current page and surrounding pages
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        if (!pages.includes('...')) {
          pages.push('...');
        }
      }
      
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Initial load - only if not already loaded from URL params
  useEffect(() => {
    // Only fetch if we don't have data or if URL params suggest we should reload
    if (locations.length === 0 && events.length === 0) {
      fetchContent(
        pagination.page,
        activeCategory,
        searchTerm,
        contentType,
        true
      );
    }
  }, []); // Empty dependency array to run only once

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
    <div className="h-[calc(100vh-65px)] flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Fixed */}
        <div className="w-80 flex-shrink-0  ">
          <div className="h-full overflow-y-auto p-4">
            <CategoriesSidebar 
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              contentType={contentType}
              onContentTypeChange={handleContentTypeChange}
              isLoading={isLoading}
            />
          </div>
        </div>
        
        {/* Main Content - Scrollable */}
        <div className="flex-1 flex flex-col">
          <div 
            id="main-content"
            className="flex-1 overflow-y-auto p-6"
          >
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${contentType}...`}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
                {searchTerm && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
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
                  onClick={() => fetchContent(pagination.page, activeCategory, searchTerm, contentType, true)}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  disabled={isLoading}
                >
                  {t('tryagain')}
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
                {isLoading && pagination.page === 1 ? 'Loading...' : (
                  <>
                    Found {pagination.total} {contentType} 
                    {pagination.totalPages > 1 && (
                      <span className="ml-2">
                        (Page {pagination.page} of {pagination.totalPages})
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>

            {/* Loading State for initial load */}
            {isLoading && pagination.page === 1 && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              </div>
            )}

            {/* Content Rendering */}
            {(!isLoading || pagination.page > 1) && !error && (
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

            {/* Enhanced Pagination */}
            {!error && pagination.totalPages > 1 && currentData.length > 0 && (
              <div className="mt-8">
                {/* Page info */}
                <div className="text-center text-sm text-gray-600 mb-4">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                
                {/* Pagination controls */}
                <div className="flex justify-center items-center space-x-1 flex-wrap gap-y-2">
                  {/* First page button */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1 || isLoading}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    First
                  </button>
                  
                  {/* Previous button */}
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!hasPreviousPage || isLoading}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  {generatePageNumbers().map((pageNum, index) => (
                    <React.Fragment key={index}>
                      {pageNum === '...' ? (
                        <span className="px-3 py-2 text-sm text-gray-500">...</span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(pageNum as number)}
                          disabled={isLoading}
                          className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                            pageNum === pagination.page
                              ? 'bg-cyan-500 text-white border-cyan-500'
                              : 'border-gray-300 hover:bg-gray-50'
                          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {pageNum}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                  
                  {/* Next button */}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!hasNextPage || isLoading}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                  
                  {/* Last page button */}
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.page === pagination.totalPages || isLoading}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Last
                  </button>
                </div>
                
                {/* Loading indicator for pagination */}
                {isLoading && pagination.page > 1 && (
                  <div className="flex justify-center mt-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {contentType !== 'events' && 
              !isLoading && !error && currentData.length === 0 && (
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

            {/* Render children if needed
            {children} */}
          </div>
        </div>
      </div>
    </div>
  );
}