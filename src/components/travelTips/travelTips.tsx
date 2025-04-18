// components/TravelTips.tsx
import React from 'react';
import Image from 'next/image';

interface TravelTipItem {
  id: string;
  title: string;
  icon: JSX.Element;
}

export default function TravelTips() {
  const tipItems: TravelTipItem[] = [
    {
      id: 'visas',
      title: 'Visas',
      icon: (
        <Image
            src="icon/cc-visa-brands.svg"
            alt="Vonders Logo"
            width={80}
            height={80}
            />
      )
    },
    {
      id: 'transport',
      title: 'Transport',
      icon: (
        <Image
            src="icon/motorcycle-solid.svg"
            alt="Vonders Logo"
            width={80}
            height={80}
            />
      )
    },
    {
      id: 'weather',
      title: 'Weather',
      icon: (
        <Image
            src="icon/cloud-solid.svg"
            alt="Vonders Logo"
            width={80}
            height={80}
            />
      )
    },
    {
      id: 'safety',
      title: 'Safety',
      icon: (
        <Image
            src="icon/user-shield-solid.svg"
            alt="Vonders Logo"
            width={80}
            height={80}
            />
      )
    },
    {
      id: 'history',
      title: 'Hitory',
      icon: (
        <Image
            src="icon/vietnam.svg"
            alt="Vonders Logo"
            width={80}
            height={80}
            />
      )
    }
  ];

  return (
    <section className="p-8 max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-center text-cyan-500 mb-3">Travel Tips</h2>
      <p className="text-gray-600 text-center mb-10">Prepare for your trip with these practical articles</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
        {tipItems.map((item) => (
          <div key={item.id} className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 text-cyan-500 mb-3 transition-transform hover:scale-110">
              {item.icon}
            </div>
            <span className="text-gray-700 font-medium text-center">{item.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

