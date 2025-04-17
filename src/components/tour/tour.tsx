'use client'
// pages/must-see-sites.tsx
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import styles from './tour.module.css';

export default function MustSeeSites() {
  const [hoveredSite, setHoveredSite] = useState<string | null>(null);

  const sites = [
    {
      name: "Hue",
      image: "/scenery/tour-1.jpg",
      description: "Former imperial capital with ancient citadel and royal tombs",
      link: "https://vietnam.travel/sites/default/files/360Tour/Hue2021/index.htm"
    },
    {
      name: "Ha Long",
      image: "/scenery/tour-2.jpg",
      description: "UNESCO World Heritage site with thousands of limestone islands",
      link: "https://vietnam.travel/sites/default/files/360Tour/HaLong/index.htm"
    },
    {
      name: "Hoi An",
      image: "/scenery/tour-3.png",
      description: "Ancient town famous for lanterns and traditional architecture",
      link: "https://vietnam.travel/sites/default/files/360Tour/HoiAn/index.htm"
    },
    {
      name: "Hanoi",
      image: "/scenery/tour-4.jpg",
      description: "Vietnam's capital with rich cultural heritage and history",
      link: "https://vietnam.travel/sites/default/files/360Tour/HaNoi/index.htm"
    },
    {
      name: "Phong Nha",
      image: "/scenery/tour-5.jpg",
      description: "Home to spectacular caves and national park",
      link: "https://vietnam.travel/sites/default/files/360Tour/PhongNha/index.htm"
    },
    {
      name: "My Son",
      image: "/scenery/tour-6.jpg",
      description: "Ancient Hindu temple complex from the Champa civilization",
      link: "https://vietnam.travel/sites/default/files/360Tour/MySon/index.htm"
    }
  ];

  return (
    <>
      <div className="px-4 py-10 min-h-screen">
        <h1 className="text-5xl font-bold text-center text-cyan-400 mb-4">Must-See Sites</h1>
        <p className="text-center text-gray-700 mb-10 max-w-3xl mx-auto">
          Take a 360-degree tour of some of the country's most compelling natural wonders and cultural attractions right here.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {sites.map((site) => (
            <Link href={site.link} key={site.name}>
              <div
                className={styles.siteCard}
                onMouseEnter={() => setHoveredSite(site.name)}
                onMouseLeave={() => setHoveredSite(null)}
              >
                <div className="relative h-64 w-full">
                  <Image
                    src={site.image}
                    alt={`${site.name} in Vietnam`}
                    fill
                    className={styles.hoverScale}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJ5hYKDvwAAAABJRU5ErkJggg=="
                  />
                  <div className={`absolute inset-0 ${styles.siteOverlay}`}></div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className={`${styles.siteName} text-4xl font-bold text-white`}>{site.name}</h2>
                      <div className="w-12 h-12 mx-auto mt-2 rounded-full border-2 border-white flex items-center justify-center text-white text-xs">
                        360°
                      </div>
                    </div>
                  </div>

                  {hoveredSite === site.name && (
                    <div className={`absolute bottom-0 left-0 right-0 ${styles.siteDescription}`}>
                      <p className="text-sm">{site.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
