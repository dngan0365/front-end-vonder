"use client";
import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  GeoJSON,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import geojsonData from "./custom.geo.json";
import { getAllLocations } from "@/api/location"; // Update with correct path

import { useAuth } from "@/context/AuthContext"
// Translage Language
import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"



// Types based on your API response
interface Location {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  category: "historical" | "cultural" | "natural" | "urban";
  province: string;
  district: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

// Function for controlling drag action when user zooms
function DragControl() {
  const map = useMap();

  useEffect(() => {
    function onZoom() {
      if (map.getZoom() > map.getMinZoom()) {
        map.dragging.enable(); // Zoomed in → allow moving
      } else {
        map.dragging.disable(); // Default zoom → lock map
        map.setView([16.5, 107.5], 6);
      }
    }

    map.on("zoomend", onZoom);
  }, [map]);

  return null;
}

interface MyMapProps {
  position: [number, number];
  zoom: number;
  searchParams?: SearchParams;
}

export default function MyMap({ position, zoom, searchParams = {} }: MyMapProps) {
  const t = useTranslations("Map");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await getAllLocations({
          limit: 100, // Get more locations for the map
          ...searchParams
        });
        setLocations(response.data);
      } catch (err) {
        setError("Failed to load locations");
        console.error("Error fetching locations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [searchParams]);

  const overlayStyle = {
    fillColor: "black", // Color outside Vietnam
    fillOpacity: 0.6, // 0.6 transparency
    color: "black",
    weight: 1,
  };

  // Function to create popup for each location
  function createLocationPopup(location: Location, index: number) {
    // Skip locations with invalid coordinates
    if (location.latitude === -1 || location.latitude === 0) {
      return null;
    }

    // Strip HTML tags from description for popup display
    const stripHtml = (html: string) => {
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    };

    const cleanDescription = stripHtml(location.description);
    const truncatedDescription = cleanDescription.length > 150 
      ? cleanDescription.substring(0, 150) + "..." 
      : cleanDescription;

    return (
      <Marker 
        key={location.id} 
        position={[location.latitude, location.longitude]}
      >
        <Popup maxWidth={300}>
          <div className="popup-content">
            <h3 className="font-bold text-lg mb-2">{location.name}</h3>
            {location.coverImage && (
              <img 
                src={location.coverImage} 
                alt={location.name}
                className="w-full h-32 object-cover rounded mb-2"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <p className="text-sm mb-2">{truncatedDescription}</p>
            <div className="text-xs text-gray-600 mb-2">
              <span className="inline-block bg-blue-100 text-blue-600 px-2 py-1 rounded mr-1">
                {location.category}
              </span>
              <span>{location.district}, {location.province}</span>
            </div>
            <a 
              href={`/locations/${location.id}`}
              className="inline-block bg-cyan-400 text-white px-3 py-1 rounded text-sm hover:bg-cyan-500 transition-colors"
            >
              Xem chi tiết
            </a>
          </div>
        </Popup>
      </Marker>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="h-[800px] w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>{t('loadingMap')}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-[800px] w-full flex items-center justify-center bg-gray-100">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Lỗi tải dữ liệu</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer 
      center={position}
      zoom={zoom}
      minZoom={zoom}
      scrollWheelZoom={true}
      dragging={false}
      className="h-[800px] w-full"
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        attribution="&copy; Thunderforest contributors"
      />
      
      {/* Render location markers */}
      {locations.map((location, index) => createLocationPopup(location, index))}

      <GeoJSON data={geojsonData} style={overlayStyle} />
      <DragControl />
    </MapContainer>
  );
}