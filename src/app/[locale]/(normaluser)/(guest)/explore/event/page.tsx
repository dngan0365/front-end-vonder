'use client'
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Users, ArrowRight } from 'lucide-react';

export default function Explore() {
  const [selectedMonth, setSelectedMonth] = useState('April');
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const events = {
    January: [
      {
        id: 'tet-festival',
        title: 'Tet Festival',
        location: 'Nationwide',
        date: 'January 25-28, 2025',
        category: 'Cultural',
        image: '/api/placeholder/800/500',
        description: 'Vietnamese New Year celebration with family gatherings, traditional foods, and festive decorations.'
      },
      {
        id: 'huong-pagoda-festival',
        title: 'Huong Pagoda Festival',
        location: 'Hanoi',
        date: 'January 30 - March 27, 2025',
        category: 'Religious',
        image: '/api/placeholder/800/500',
        description: 'Annual pilgrimage to the sacred Buddhist site featuring boat rides through limestone caves.'
      }
    ],
    February: [
      {
        id: 'lantern-festival',
        title: 'Lantern Festival',
        location: 'Hoi An',
        date: 'February 15, 2025',
        category: 'Cultural',
        image: '/api/placeholder/800/500',
        description: 'Experience the magic of hundreds of colorful lanterns lighting up the ancient town.'
      }
    ],
    March: [
      {
        id: 'bu-duong-festival',
        title: 'Bu Duong Festival',
        location: 'Kon Tum',
        date: 'March 8-10, 2025',
        category: 'Cultural',
        image: '/api/placeholder/800/500',
        description: 'Traditional festival of the Ba Na ethnic group celebrating the new rice harvest.'
      }
    ],
    April: [
      {
        id: 'hung-kings-temple-festival',
        title: 'Hung Kings Temple Festival',
        location: 'Phu Tho',
        date: 'April 14-16, 2025',
        category: 'Historical',
        image: '/api/placeholder/800/500',
        description: 'National holiday honoring the legendary founders of Vietnam with traditional ceremonies.'
      },
      {
        id: 'halong-bay-carnival',
        title: 'Ha Long Bay Carnival',
        location: 'Vinh Ha Long',
        date: 'April 29, 2025',
        category: 'Urban',
        image: '/api/placeholder/800/500',
        description: 'Vibrant street performances, parades, and cultural activities celebrating the UNESCO World Heritage site.'
      }
    ],
    May: [
      {
        id: 'dalat-flower-festival',
        title: 'Da Lat Flower Festival',
        location: 'Da Lat',
        date: 'May 12-16, 2025',
        category: 'Natural',
        image: '/api/placeholder/800/500',
        description: 'Spectacular flower displays and exhibitions in Vietnam\'s city of eternal spring.'
      }
    ],
    June: [
      {
        id: 'nha-trang-sea-festival',
        title: 'Nha Trang Sea Festival',
        location: 'Nha Trang',
        date: 'June 5-9, 2025',
        category: 'Beach',
        image: '/api/placeholder/800/500',
        description: 'Beach activities, water sports, seafood festival, and cultural performances by the beautiful coast.'
      }
    ],
    July: [
      {
        id: 'sapa-trekking-festival',
        title: 'Sapa Trekking Festival',
        location: 'Sapa',
        date: 'July 18-20, 2025',
        category: 'Mountain',
        image: '/api/placeholder/800/500',
        description: 'Hiking adventures through terraced rice fields and ethnic minority villages in Northern Vietnam.'
      }
    ],
    August: [
      {
        id: 'vietnam-food-festival',
        title: 'Vietnam Food Festival',
        location: 'Ho Chi Minh City',
        date: 'August 8-10, 2025',
        category: 'Cultural',
        image: '/api/placeholder/800/500',
        description: 'Culinary celebration featuring regional specialties from across Vietnam.'
      }
    ],
    September: [
      {
        id: 'mid-autumn-festival',
        title: 'Mid-Autumn Festival',
        location: 'Nationwide',
        date: 'September 15, 2025',
        category: 'Cultural',
        image: '/api/placeholder/800/500',
        description: 'Traditional moon-viewing festival with mooncakes, lanterns, and lion dances.'
      }
    ],
    October: [
      {
        id: 'mekong-delta-festival',
        title: 'Mekong Delta Festival',
        location: 'Can Tho',
        date: 'October 3-5, 2025',
        category: 'Cultural',
        image: '/api/placeholder/800/500',
        description: 'Celebration of the river culture with floating markets, boat races, and fruit displays.'
      }
    ],
    November: [
      {
        id: 'hue-festival',
        title: 'Hue Festival',
        location: 'Hue',
        date: 'November 12-16, 2025',
        category: 'Historical',
        image: '/api/placeholder/800/500',
        description: 'Cultural performances and royal ceremonies at the ancient imperial capital.'
      }
    ],
    December: [
      {
        id: 'countdown-festival',
        title: 'New Year Countdown Festival',
        location: 'Hanoi',
        date: 'December 31, 2025',
        category: 'Urban',
        image: '/api/placeholder/800/500',
        description: 'Spectacular fireworks and musical performances to welcome the new year.'
      }
    ]
  };

  const categories = [
    'Events', 'Cultural', 'Natural', 'Historical', 'Religious',
    'Urban', 'Beach', 'Mountain', 'Adventure', 'Resort', 'Others'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Immerse in Vietnam - Events & Experiences</title>
        <meta name="description" content="Discover amazing events and experiences across Vietnam" />
      </Head>

      {/* Hero Banner */}
      <div className="relative bg-cyan-400 h-80">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute right-0 bottom-0 w-1/3 h-full bg-white opacity-10 transform rotate-45 translate-x-1/4 translate-y-1/4"></div>
          <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-white opacity-5 transform -rotate-12 translate-x-1/3"></div>
        </div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10">
          <h1 className="text-5xl font-bold text-white mb-6">IMMERSE IN VIETNAM</h1>
          <div className="flex items-center text-white">
            <span className="mr-2">1</span>
            <div className="h-1 bg-white flex-grow rounded-full">
              <div className="bg-white h-3 w-3 rounded-full absolute transform -translate-y-1"></div>
            </div>
            <span className="ml-2">5</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex flex-wrap">

        {/* Content */}
        <div className="w-full md:w-3/4">
          {/* Month Selector */}
          <div className="bg-white rounded-lg shadow mb-8 overflow-x-auto">
            <div className="flex p-4 min-w-max">
              {months.map((month) => (
                <button
                  key={month}
                  className={`px-6 py-3 text-center whitespace-nowrap ${
                    selectedMonth === month
                      ? 'text-cyan-600 border-b-2 border-cyan-400 font-medium'
                      : 'text-gray-600 hover:text-cyan-600'
                  }`}
                  onClick={() => setSelectedMonth(month)}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events[selectedMonth]?.map((event) => (
              <Link href={`/events/${event.id}`} key={event.id}>
                <div className="bg-white rounded-lg shadow overflow-hidden transition-transform hover:transform hover:scale-105 h-full flex flex-col">
                  <div className="relative h-48">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded">
                      {event.category}
                    </div>
                  </div>
                  <div className="p-4 flex-grow">
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>
                    <div className="flex items-center text-gray-500 mb-2">
                      <MapPin size={16} className="mr-2" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Calendar size={16} className="mr-2" />
                      <span>{event.date}</span>
                    </div>
                  </div>
                  <div className="border-t p-4 flex justify-end">
                    <span className="text-cyan-600 font-medium flex items-center">
                      View Details <ArrowRight size={16} className="ml-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            
            {/* Show message if no events for the month */}
            {(!events[selectedMonth] || events[selectedMonth].length === 0) && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No events scheduled for {selectedMonth}.</p>
                <p className="text-gray-400">Please check other months or check back later.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
