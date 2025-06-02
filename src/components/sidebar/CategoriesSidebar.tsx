import React from 'react';

interface CategoriesSidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  contentType: 'locations' | 'events';
  onContentTypeChange: (type: 'locations' | 'events') => void;
  isLoading?: boolean;
}

const CategoriesSidebar: React.FC<CategoriesSidebarProps> = ({ 
  activeCategory, 
  onCategoryChange,
  contentType,
  onContentTypeChange,
  isLoading = false 
}) => {
  const categories = [
    { id: 'events', name: 'Events', type: 'events' as const },
    { id: 'all', name: 'All Locations', type: 'locations' as const },
    { id: 'cultural', name: 'Cultural', type: 'locations' as const },
    { id: 'historical', name: 'Historical', type: 'locations' as const },
    { id: 'religious', name: 'Religious', type: 'locations' as const },
    { id: 'natural', name: 'Natural', type: 'locations' as const },
    { id: 'beach', name: 'Beach', type: 'locations' as const },
    { id: 'urban', name: 'Urban', type: 'locations' as const },
    { id: 'adventure', name: 'Adventure', type: 'locations' as const },
    { id: 'others', name: 'Others', type: 'locations' as const }
  ];

  const handleCategoryClick = (category: typeof categories[0]) => {
    if (isLoading) return;
    
    // If clicking Events, switch to events content type
    if (category.id === 'events') {
      onContentTypeChange('events');
      onCategoryChange('all'); // Reset to 'all' for events
    } else {
      // For location categories, switch to locations content type
      onContentTypeChange('locations');
      onCategoryChange(category.id);
    }
  };

  const getActiveState = (category: typeof categories[0]) => {
    if (category.id === 'events') {
      return contentType === 'events';
    } else {
      return contentType === 'locations' && activeCategory === category.id;
    }
  };

  return (
    <div className="w-64 pr-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Categories</h2>
      <div className="flex flex-col space-y-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            disabled={isLoading}
            className={`py-3 px-5 rounded-md transition-colors text-left ${
              getActiveState(category)
                ? 'bg-cyan-400 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            } ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {category.name}
            {isLoading && getActiveState(category) && (
              <span className="ml-2 inline-block animate-spin">⟳</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSidebar;