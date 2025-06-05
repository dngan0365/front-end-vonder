"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
} from "lucide-react";
import { amenitiesConfig } from "./amenitiesConfig";
import axios from "axios";
import DestinationData from "./destinationVietnam.json";
import Navbar from "@/components/navbar/navbar";

// Types - you may need to adjust these based on your actual API types
interface HotelSearchhotelData {
  latitude: number;
  longitude: number;
  radius: number;
  radiusUnit: "KM" | "MI";
  amenities: string[];
  ratings: string[];
  hotelSource: "ALL" | "BEDBANK" | "DIRECTCHAIN";
}

interface Province {
  name: string;
  latitude: number;
  longitude: number;
}

type RatingType = "1" | "2" | "3" | "4" | "5";

export interface HotelDistanceInfo {
  name: string;
  distance: {
    value: number;
  };
}

const HotelSearchFilter: React.FC = () => {
  const [hotelData, setHotelData] = useState<HotelSearchhotelData>({
    latitude: 0,
    longitude: 0,
    radius: 20,
    radiusUnit: "KM",
    amenities: [],
    ratings: [],
    hotelSource: "ALL",
  });
  const ratingList: RatingType[] = ["1", "2", "3", "4", "5"];
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDestinations, setFilteredDestinations] = useState<Province[]>(
    []
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  // New state for hotels and pagination
  const [hotels, setHotels] = useState<HotelDistanceInfo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const hotelsPerPage = 4;

  // Calculate pagination
  const totalPages = Math.ceil(hotels.length / hotelsPerPage);
  const startIndex = (currentPage - 1) * hotelsPerPage;
  const endIndex = startIndex + hotelsPerPage;
  const currentHotels = hotels.slice(startIndex, endIndex);

  const handleAmenityToggle = (amenityValue: string) => {
    const newAmenities = hotelData.amenities.includes(amenityValue)
      ? hotelData.amenities.filter((a) => a !== amenityValue)
      : [...hotelData.amenities, amenityValue];
    setHotelData((prev) => ({
      ...prev,
      amenities: newAmenities,
    }));
  };

  const handleSubmit = async () => {
    if (!searchTerm.trim()) {
      alert("Please select a destination");
      return;
    }

    if (hotelData.latitude === 0 && hotelData.longitude === 0) {
      alert("Please select a valid destination from the suggestions");
      return;
    }

    try {
      // Format the data properly for the API
      const queryParams = {
        latitude: hotelData.latitude,
        longitude: hotelData.longitude,
        radius: hotelData.radius,
        radiusUnit: hotelData.radiusUnit,
        hotelSource: hotelData.hotelSource,
        // Convert arrays to comma-separated strings
        ...(hotelData.amenities.length > 0 && {
          amenities: hotelData.amenities.join(","),
        }),
        ...(hotelData.ratings.length > 0 && {
          ratings: hotelData.ratings.join(","),
        }),
      };

      // Remove undefined values
      const cleanParams = Object.fromEntries(
        Object.entries(queryParams).filter(([_, value]) => value !== undefined)
      );

      const queryString = new URLSearchParams(cleanParams as any).toString();
      console.log(
        "Full URL:",
        `http://localhost:3300/api/hotels/search?${queryString}`
      );
      console.log("Submitting Hotel Search Query:", cleanParams);

      setIsLoading(true);
      const response = await axios.get(
        "http://localhost:3300/api/hotels/search",
        {
          params: cleanParams,
        }
      );

      console.log("Hotel search response:", response.data);

      if (response.data.success) {
        const rawApiResponse = response.data.data.data;
        console.log("Found hotels:", rawApiResponse);
        console.log("Type of rawApiResponse:", typeof rawApiResponse);
        console.log("Is array:", Array.isArray(rawApiResponse));

        // Check if rawApiResponse is an array
        if (Array.isArray(rawApiResponse)) {
          const hotelsData: HotelDistanceInfo[] = rawApiResponse.map(
            (hotel: HotelDistanceInfo) => ({
              name: hotel.name,
              distance: {
                value: hotel.distance?.value,
              },
            })
          );

          // Set hotels state and reset pagination
          setHotels(hotelsData);
          setCurrentPage(1);

          alert(`Found ${hotelsData.length} hotels in your area!`);
        } else {
          console.error("API response data is not an array:", rawApiResponse);
          // Handle case where data might be an object with results array
          if (rawApiResponse && typeof rawApiResponse === "object") {
            // Try to find an array property in the response
            const possibleArrays = Object.values(rawApiResponse).filter(
              Array.isArray
            );
            if (possibleArrays.length > 0) {
              const hotelsArray = possibleArrays[0] as HotelDistanceInfo[];
              const hotelsData: HotelDistanceInfo[] = hotelsArray.map(
                (hotel: HotelDistanceInfo) => ({
                  name: hotel.name,
                  distance: {
                    value: hotel.distance?.value,
                  },
                })
              );
              setHotels(hotelsData);
              setCurrentPage(1);
              alert(`Found ${hotelsData.length} hotels in your area!`);
            } else {
              setHotels([]);
              alert("No hotels found or unexpected data format");
            }
          } else {
            setHotels([]);
            alert("No hotels found or unexpected data format");
          }
        }
      } else {
        throw new Error(response.data.message || "Failed to search hotels");
      }
    } catch (error) {
      console.error("Error searching hotels:", error);

      if (axios.isAxiosError(error) && error.response?.data) {
        console.error("Error details:", error.response.data);
        alert(
          `Error: ${error.response.data.message || "Failed to search hotels"}`
        );
      } else {
        alert("Error searching hotels. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  function normalizeText(text: string): string {
    return text
      .normalize("NFD") // Decompose accents
      .replace(/[\u0300-\u036f]/g, "") // Remove accent marks
      .toLowerCase(); // Optional: ignore case
  }

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      const filtered = DestinationData.filter((p) =>
        normalizeText(p.name).includes(normalizeText(searchTerm))
      );

      setFilteredDestinations(filtered);
      setShowSuggestions(true);
      setActiveSuggestion(-1);
    } else {
      setFilteredDestinations([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  const handleSuggestionClick = (destination: Province) => {
    setSearchTerm(destination.name);
    setHotelData((prev) => ({
      ...prev,
      latitude: destination.latitude,
      longitude: destination.longitude,
    }));
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredDestinations.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveSuggestion((prev) =>
          prev < filteredDestinations.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeSuggestion >= 0) {
          handleSuggestionClick(filteredDestinations[activeSuggestion]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        break;
    }
  };

  // Pagination handlers
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Hotel Results Render Function
  const renderHotelResults = () => {
    if (hotels.length === 0) return null;

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Results Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              🏨 Search Results
            </h2>
            <p className="text-gray-600">
              Found{" "}
              <span className="font-semibold text-cyan-600">
                {hotels.length}
              </span>{" "}
              hotels in {searchTerm}
            </p>
          </div>

          {/* Hotels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {currentHotels.map((hotel, index) => (
              <div
                key={`${hotel.name}-${startIndex + index}`}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-cyan-300 bg-gradient-to-br from-white to-gray-50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {hotel.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-2 text-cyan-500" />
                      <span className="text-sm">
                        {hotel.distance?.value
                          ? `${hotel.distance.value.toFixed(
                              1
                            )} ${hotelData.radiusUnit.toLowerCase()}`
                          : "Distance not available"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    #{startIndex + index + 1}
                  </div>
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  currentPage === 1
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-cyan-600"
                }`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageClick(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        currentPage === page
                          ? "text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-cyan-600"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  currentPage === totalPages
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-cyan-600"
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}

          {/* Pagination Info */}
          <div className="text-center mt-4 text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, hotels.length)} of{" "}
            {hotels.length} results
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-blue-600">
      <Navbar />
      {/* Header Section */}
      <div className="text-center py-16 px-4">
        <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
          <span className="text-white text-sm">
            ⭐ Trusted by 2M+ travelers
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          FIND YOUR PERFECT
          <br />
          <span className="text-yellow-300">HOTEL STAY</span>
        </h1>
        <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-8">
          Discover amazing hotel deals worldwide with our smart search engine
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
            <span className="mr-2">⚡</span>
            Instant Search
          </div>
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
            <span className="mr-2">💰</span>
            Best Price Guarantee
          </div>
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
            <span className="mr-2">💬</span>
            24/7 Support
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Advanced Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* City Code with Suggestions */}
            <div className="relative">
              <label className="block text-gray-700 font-semibold mb-2">
                <span className="text-cyan-500">📍</span> City Code *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="cityCode"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => searchTerm && setShowSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="Type city name..."
                  required
                />
                <ChevronDown
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-transform ${
                    showSuggestions ? "rotate-180" : ""
                  }`}
                  size={20}
                />
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && filteredDestinations.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredDestinations.map((destination, index) => (
                    <div
                      key={`${destination.name}-${index}`}
                      className={`px-4 py-3 cursor-pointer transition-colors ${
                        index === activeSuggestion
                          ? "bg-cyan-50 text-cyan-700"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleSuggestionClick(destination)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{destination.name}</span>
                        <span className="text-xs text-gray-500">
                          {destination.latitude.toFixed(2)},{" "}
                          {destination.longitude.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showSuggestions &&
                searchTerm &&
                filteredDestinations.length === 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No destinations found for "{searchTerm}"
                    </div>
                  </div>
                )}
            </div>

            {/* Star Ratings */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <span className="text-cyan-500">⭐</span> Star Ratings
              </label>
              <div className="flex gap-2">
                {ratingList.map((rating) => (
                  <label
                    key={rating}
                    className="flex items-center justify-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={rating}
                      checked={hotelData.ratings.includes(rating)}
                      onChange={(e) => {
                        const newRatings = e.target.checked
                          ? [...hotelData.ratings, rating]
                          : hotelData.ratings.filter((r) => r !== rating);
                        setHotelData((prev) => ({
                          ...prev,
                          ratings: newRatings,
                        }));
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 cursor-pointer transition-all font-semibold ${
                        hotelData.ratings.includes(rating)
                          ? "border-cyan-500 bg-cyan-500 text-white shadow-lg transform scale-105"
                          : "border-gray-300 hover:border-cyan-300 hover:bg-cyan-50"
                      }`}
                    >
                      {rating}
                      <span className="text-yellow-500">★</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Amenities Section - Full Width */}
          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-4">
              <span className="text-cyan-500">🛎️</span> Hotel Amenities
            </label>
            <p className="text-gray-600 text-sm mb-4">
              Select the amenities that matter most to you
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {amenitiesConfig.map((amenity) => (
                <button
                  key={amenity.value}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity.value)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 ${
                    hotelData.amenities.includes(amenity.value)
                      ? `${amenity.color} border-current shadow-md scale-105`
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`p-2 rounded-full ${
                        hotelData.amenities.includes(amenity.value)
                          ? "bg-white/20"
                          : "bg-gray-100"
                      }`}
                    >
                      {amenity.icon}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        hotelData.amenities.includes(amenity.value)
                          ? "text-current"
                          : "text-gray-700"
                      }`}
                    >
                      {amenity.label}
                    </span>
                  </div>

                  {/* Selected indicator */}
                  {hotelData.amenities.includes(amenity.value) && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Selected count indicator */}
            {hotelData.amenities.length > 0 && (
              <div className="mt-4 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                <p className="text-cyan-700 text-sm">
                  <span className="font-semibold">
                    {hotelData.amenities.length}
                  </span>{" "}
                  amenities selected:{" "}
                  <span className="text-cyan-600">
                    {hotelData.amenities
                      .map(
                        (a) =>
                          amenitiesConfig.find((config) => config.value === a)
                            ?.label
                      )
                      .join(", ")}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-12 py-4 rounded-xl font-semibold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto gap-3 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search size={24} />
                  Search Amazing Hotels
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hotel Results Section */}
      {renderHotelResults()}
    </div>
  );
};

export default HotelSearchFilter;
