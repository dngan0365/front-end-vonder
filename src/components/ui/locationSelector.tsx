'use client'
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { searchLocations } from '@/api/location';
import { XIcon, CalendarIcon, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function LocationSelector({ 
  value = [], 
  onChange 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedLocations, setExpandedLocations] = useState({});
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Fetch location suggestions when search term changes
  useEffect(() => {
    if (debouncedSearchTerm.length < 2) {
      setSuggestions([]);
      return;
    }
    
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const results = await searchLocations(debouncedSearchTerm);
        // Filter out already selected locations
        const filteredResults = results.filter(
          suggestion => !value.some(item => item.id === suggestion.id)
        );
        setSuggestions(filteredResults);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSuggestions();
  }, [debouncedSearchTerm, value]);
  
  const handleSelect = (suggestion) => {
    const newLocation = {
      ...suggestion,
      startDateTime: null,
      endDateTime: null,
      description: ''
    };
    
    const newValue = [...value, newLocation];
    onChange(newValue);
    setSearchTerm('');
    setSuggestions([]);
    
    // Auto-expand the newly added location
    setExpandedLocations(prev => ({
      ...prev,
      [newLocation.id]: true
    }));
  };
  
  const handleRemove = (locationId) => {
    onChange(value.filter(item => item.id !== locationId));
    
    // Remove from expanded state
    setExpandedLocations(prev => {
      const newState = { ...prev };
      delete newState[locationId];
      return newState;
    });
  };

  const toggleLocationExpanded = (locationId) => {
    setExpandedLocations(prev => ({
      ...prev,
      [locationId]: !prev[locationId]
    }));
  };

  const updateLocationField = (locationId, field, newValue) => {
    onChange(
      value.map(location => 
        location.id === locationId 
          ? { ...location, [field]: newValue } 
          : location
      )
    );
  };
  
  // Format time from Date object for display
  const formatTime = (date) => {
    if (!date) return '';
    return format(date, "h:mm a");
  };

  // Add time to a date object
  const setTimeForDate = (date, timeString) => {
    if (!date || !timeString) return date;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    return newDate;
  };

  return (
    <div className="w-full space-y-4">
      {/* Selected Locations with Details */}
      {value.length > 0 && (
        <div className="space-y-3">
          {value.map(location => (
            <div 
              key={location.id} 
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Location Header */}
              <div 
                className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                onClick={() => toggleLocationExpanded(location.id)}
              >
                <div className="font-medium">{location.name}</div>
                <div className="flex items-center space-x-2">
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(location.id);
                    }}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <XIcon size={18} />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedLocations[location.id] && (
                <div className="p-4 space-y-4">
                  {/* Date/Time Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div>
                      <Label className="mb-1 block">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !location.startDateTime && "text-gray-400"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {location.startDateTime 
                              ? format(location.startDateTime, "PPP") 
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={location.startDateTime}
                            onSelect={(date) => updateLocationField(location.id, 'startDateTime', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Start Time */}
                    <div>
                      <Label className="mb-1 block">Start Time</Label>
                      <input
                        type="time"
                        value={location.startDateTime ? format(location.startDateTime, "HH:mm") : ""}
                        onChange={(e) => {
                          const baseDate = location.startDateTime || new Date();
                          const newDateTime = setTimeForDate(baseDate, e.target.value);
                          updateLocationField(location.id, 'startDateTime', newDateTime);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={!location.startDateTime}
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <Label className="mb-1 block">End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !location.endDateTime && "text-gray-400"
                            )}
                            disabled={!location.startDateTime}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {location.endDateTime 
                              ? format(location.endDateTime, "PPP") 
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={location.endDateTime}
                            onSelect={(date) => updateLocationField(location.id, 'endDateTime', date)}
                            disabled={(date) => {
                              // Disable dates before the start date
                              return location.startDateTime 
                                ? date < new Date(location.startDateTime.setHours(0,0,0,0)) 
                                : true;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* End Time */}
                    <div>
                      <Label className="mb-1 block">End Time</Label>
                      <input
                        type="time"
                        value={location.endDateTime ? format(location.endDateTime, "HH:mm") : ""}
                        onChange={(e) => {
                          const baseDate = location.endDateTime || (location.startDateTime ? new Date(location.startDateTime) : new Date());
                          const newDateTime = setTimeForDate(baseDate, e.target.value);
                          updateLocationField(location.id, 'endDateTime', newDateTime);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={!location.endDateTime}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label className="mb-1 block">Location Description (Optional)</Label>
                    <Textarea
                      value={location.description || ''}
                      onChange={(e) => updateLocationField(location.id, 'description', e.target.value)}
                      placeholder="Add any specific details about this location..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Search for locations..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        
        {isOpen && (searchTerm.length >= 2 || isLoading) && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {isLoading ? (
              <div className="p-3 text-center text-gray-500">Loading...</div>
            ) : suggestions.length > 0 ? (
              suggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onMouseDown={() => handleSelect(suggestion)}
                >
                  {suggestion.name}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500">
                {searchTerm.length >= 2 ? 'No locations found' : 'Type at least 2 characters to search'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Empty State */}
      {value.length === 0 && (
        <div className="text-center py-4 text-gray-500 border border-dashed border-gray-300 rounded-md">
          No locations selected. Search and add locations above.
        </div>
      )}
    </div>
  );
}