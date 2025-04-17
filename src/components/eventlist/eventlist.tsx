'use client'
import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';

export default function EvenList() {
  const currentMonth = new Date().toLocaleString('en-US', { month: 'short' }); // Get real month
  const [activeMonth, setActiveMonth] = useState(currentMonth); // use it here

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const events = [
    {
      id: 1,
      title: "Vinh Ha Long",
      description: "Breathtaking landscapes, cultural heritage, and a blend of modern and traditional charm.",
      image: "/scenery/feature-1.jpg",
      date: "2025-04-20", 
    },
    {
      id: 2,
      title: "Festival Hanoi",
      description: "Traditional culture festivals in Hanoi.",
      image: "/scenery/event-1.jpg",
      date: "2025-05-05",
    },
    {
      id: 3,
      title: "Da Nang Fireworks Festival",
      description: "Spectacular fireworks competition between countries.",
      image: "/scenery/event-2.jpg",
      date: "2025-06-15",
    },
    {
      id: 4,
      title: "Sapa Summer Festival",
      description: "Unique local culture performances and parades.",
      image: "/scenery/event-3.jpg",
      date: "2025-05-18",
    }
  ];

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
              onClick={() => setActiveMonth(month)}
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

      {/* Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events
          .filter((event) => {
            const eventMonth = new Date(event.date).toLocaleString('en-US', { month: 'short' });
            return eventMonth === activeMonth;
          })
          .map((event) => (
            <div key={event.id} className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="h-64 relative">
                <div className="w-full h-full bg-blue-600 relative">
                  <Image 
                    src={event.image} 
                    alt={event.title}
                    fill
                  />
                </div>
              </div>
              <div className="p-4 text-center">
                <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                <p className="text-gray-500 text-sm mb-2">
                  {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p> 
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="text-right">
                  <button className="text-gray-800">Detail</button>
                </div>
              </div>
            </div>
        ))}
      </div>

      {/* See more button */}
      <div className="text-right mt-6">
        <button className="text-gray-600">See more</button>
      </div>
    </div>
  );
}
