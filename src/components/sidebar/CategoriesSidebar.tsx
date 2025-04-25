import React from 'react';
import Link from 'next/link';

const CategoriesSidebar = ({ activeCategory }) => {
  const categories = [
    { id: 'events', name: 'Events' },
    { id: 'cultural', name: 'Cultural' },
    { id: 'historical', name: 'Historical' },
    { id: 'religious', name: 'Religious'},
    { id: 'natural', name: 'Natural' },
    { id: 'beach', name: 'Beach' },
    { id: 'urban', name: 'Urban' },
    { id: 'adventure', name: 'Adventure'},
    { id: 'others', name: 'Others' }
  ];

  return (
    <div className="w-64 pr-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Categories</h2>
      <div className="flex flex-col space-y-3">
        {categories.map((category) => (
          <Link 
            href={`/categories/${category.id}`} 
            key={category.id}
            className={`py-3 px-5 rounded-md transition-colors ${
              activeCategory === category.id
                ? 'bg-cyan-400 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSidebar;