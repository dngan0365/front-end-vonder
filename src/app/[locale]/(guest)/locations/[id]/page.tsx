'use client'

import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { getLocationById } from "@/api/location";
import { Facebook, Mail, MapPin, Share2, Tag, Twitter } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type Location = {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  province: string;
  district?: string;
  category: string;
  latitude?: number;
  longitude?: number;
};

export default function LocationDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  console.log(id)
  const authStatus = useAuth();
  const [location, setLocation] = useState<Location | null>(null);
  const isAuthenticated = !!authStatus;

  const fetchLocation = async (locationId: string) => {
    try {
      const locationData = await getLocationById(locationId);
      setLocation(locationData);
    } catch (error) {
      console.error("Error fetching location:", error);
      notFound();
    }
  };
  useEffect(() => {
    fetchLocation(id);
  }, [id]);  // Dependency on `params.id` to fetch new location when it changes

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[80vh] overflow-hidden">
        <Image
          src={location?.coverImage}
          alt={location?.name || ""}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-wide drop-shadow-md transition-all duration-700">
            {location?.name}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Metadata + Favorite */}
        <div className="flex flex-col items-center mb-12 space-y-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2 bg-amber-100 px-5 py-2 rounded-full shadow-sm">
              <MapPin className="h-5 w-5 text-amber-700" />
              <span className="font-medium">{location?.province}</span>
              {location?.district && <span>- {location?.district}</span>}
            </div>
            <div className="flex items-center gap-2 bg-emerald-100 px-5 py-2 rounded-full shadow-sm">
              <Tag className="h-5 w-5 text-emerald-700" />
              <span className="font-medium">{location?.category}</span>
            </div>
          </div>

          {isAuthenticated ? (
            location && <FavoriteButton location={location} className="mt-4" />
          ) : (
            <Link href="/auth/login">
              <button className="mt-4 px-6 py-2 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold transition duration-300">
                Login to Favorite
              </button>
            </Link>
          )}
        </div>

        {/* Social Sharing */}
        <div className="flex justify-center gap-4 mb-12">
          {[
            { icon: <Facebook size={18} />, color: "bg-blue-600" },
            { icon: <Twitter size={18} />, color: "bg-sky-500" },
            { icon: <Share2 size={18} />, color: "bg-rose-500" },
            { icon: <Mail size={18} />, color: "bg-emerald-600" },
          ].map((btn, i) => (
            <button
              key={i}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white ${btn.color} hover:scale-110 transform transition-transform duration-300`}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed mb-16 transition-opacity duration-700">
          <div dangerouslySetInnerHTML={{ __html: location?.description }} />
        </div>

        {/* Additional Info Sections */}
        <div className="grid md:grid-cols-2 gap-10">
          {/* Location Details */}
          <div className="bg-amber-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-2xl font-bold mb-4 text-amber-700">Location Details</h3>
            <ul className="space-y-3">
              <li><span className="font-semibold">Province:</span> {location?.province}</li>
              {location?.district && <li><span className="font-semibold">District:</span> {location?.district}</li>}
              {location?.latitude && location?.longitude && (
                <li>
                  <span className="font-semibold">Coordinates:</span> {location?.latitude.toFixed(6)}, {location?.longitude.toFixed(6)}
                </li>
              )}
              <li><span className="font-semibold">Category:</span> {location?.category}</li>
            </ul>
          </div>

          {/* Visit Planning */}
          <div className="bg-emerald-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-2xl font-bold mb-4 text-emerald-700">Visit Information</h3>
            <p className="text-gray-700 mb-6">
              Discover the best of {location?.category.toLowerCase()} in {location?.province}.
              Plan your unforgettable trip and immerse yourself in its beauty.
            </p>
            <Link
              href={isAuthenticated
                ? `/trip/create?locationId=${location?.id}&locationName=${encodeURIComponent(location?.name)}`
                : `/auth/login`}
            >
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-full w-full transition-transform transform hover:scale-105 duration-300">
                {isAuthenticated ? "Plan Your Visit" : "Login to Plan Visit"}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
