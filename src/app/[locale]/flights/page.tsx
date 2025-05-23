"use client";

import React, { useState } from "react";
import {
  Search,
  Plane,
  Calendar,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Heart,
} from "lucide-react";
import Navbar from "@/components/navbar/navbar";

// interface for the API data
// Root response
export interface FlightSearchResponse {
  meta: Meta;
  data: FlightOffer[];
  dictionaries: Dictionaries;
}

export interface Meta {
  count: number;
  links: {
    self: string;
  };
}

export interface FlightOffer {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Itinerary[];
  price: Price;
  pricingOptions: PricingOptions;
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

export interface Itinerary {
  duration: string;
  segments: Segment[];
}

export interface Segment {
  departure: AirportEvent;
  arrival: AirportEvent;
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  operating: {
    carrierCode: string;
  };
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

export interface AirportEvent {
  iataCode: string;
  terminal?: string;
  at: string;
}

export interface Price {
  currency: string;
  total: string;
  base: string;
  fees: Fee[];
  grandTotal: string;
}

export interface Fee {
  amount: string;
  type: string;
}

export interface PricingOptions {
  fareType: string[];
  includedCheckedBagsOnly: boolean;
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: {
    currency: string;
    total: string;
    base: string;
  };
  fareDetailsBySegment: FareDetailsBySegment[];
}

export interface FareDetailsBySegment {
  segmentId: string;
  cabin: string;
  fareBasis: string;
  class: string;
  includedCheckedBags: {
    weight: number;
    weightUnit: string;
  };
}

export interface Dictionaries {
  locations: Record<
    string,
    {
      cityCode: string;
      countryCode: string;
    }
  >;
  aircraft: Record<string, string>;
  currencies: Record<string, string>;
  carriers: Record<string, string>;
}

const FlightSearchPage = () => {
  const [searchParams, setSearchParams] = useState({
    originLocationCode: "",
    destinationLocationCode: "",
    departureDate: "",
    adults: 1,
    children: 0,
    travelClass: "ECONOMY",
    includedAirlineCodes: "",
    excludedAirlineCodes: "",
    nonStop: false,
    currencyCode: "VND",
    maxPrice: "",
    max: 10,
  });

  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  //   so there is a lot of type, input and select is diff so we have to add a type initilization
  type FormElement = HTMLInputElement | HTMLSelectElement;

  const handleInputChange = (e: React.ChangeEvent<FormElement>) => {
    const target = e.target;
    const name = target.name;

    if (target instanceof HTMLInputElement) {
      const value = target.type === "checkbox" ? target.checked : target.value;

      setSearchParams((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      //not inputelemet so dont have checked
      const value = target.value;
      setSearchParams((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSearch = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    setSearchPerformed(true);
    setFlights([]); // Clear previous results

    // Construct query string from searchParams
    const query = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        // Ensure only set params are sent
        if (typeof value === "boolean") {
          query.append(key, String(value));
        } else {
          query.append(key, String(value));
        }
      }
    });

    // --- IMPORTANT: Replace with your NestJS API endpoint ---
    const backendApiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3001/api/flights/search";

    const backendApiUrl = `${backendApiBaseUrl}/api/flights/search`

    try {
      console.log(`Fetching from: ${backendApiUrl}?${query.toString()}`); // For debugging
      const response = await fetch(`${backendApiUrl}?${query.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        // You might want to display a user-friendly error message here
        // For example, using a toast notification or an error state
        alert(`Error: ${errorData.message || "Failed to fetch flights"}`);
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result: FlightSearchResponse = await response.json(); // Use your existing interface
      setFlights(result.data || []); // Amadeus might return no 'data' key if no flights found
      // or if the structure is slightly different.
      // Ensure `result.data` matches your `FlightOffer[]` expectation.
      // And that `result.dictionaries` is also handled if needed for display.
    } catch (error) {
      console.error("Failed to fetch flights:", error);
      // Set an error state here to display to the user
      setFlights([]); // Ensure flights are cleared on error
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration: Segment["duration"]) => {
    const match = duration.match(/PT(\d+)H(\d+)M/);
    if (match) {
      return `${match[1]}h ${match[2]}m`;
    }
    return duration;
  };

  const formatTime = (arrival: Segment["arrival"]) => {
    return new Date(arrival.at).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (departure: Segment["departure"]) => {
    return new Date(departure.at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Header */}
      <Navbar />

      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 text-white py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full animate-bounce"
            style={{ animationDelay: "0s", animationDuration: "3s" }}
          ></div>
          <div
            className="absolute top-20 -left-10 w-32 h-32 bg-white/5 rounded-full animate-bounce"
            style={{ animationDelay: "1s", animationDuration: "4s" }}
          ></div>
          <div
            className="absolute bottom-10 right-20 w-24 h-24 bg-white/10 rounded-full animate-bounce"
            style={{ animationDelay: "2s", animationDuration: "5s" }}
          ></div>

          {/* Floating Planes */}
          <div className="absolute top-32 left-10 animate-pulse">
            <Plane className="w-8 h-8 text-white/20 transform rotate-45" />
          </div>
          <div
            className="absolute bottom-20 right-32 animate-pulse"
            style={{ animationDelay: "1.5s" }}
          >
            <Plane className="w-6 h-6 text-white/20 transform -rotate-12" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                <Star className="w-4 h-4 text-yellow-300" />
                <span>Trusted by 2M+ travelers</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              FIND YOUR PERFECT
              <span className="block bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                FLIGHT ADVENTURE
              </span>
            </h1>

            <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-3xl mx-auto">
              Discover amazing flight deals to destinations worldwide with our
              smart search engine
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Zap className="w-4 h-4 mr-2 text-yellow-300" />
                Instant Search
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Shield className="w-4 h-4 mr-2 text-green-300" />
                Best Price Guarantee
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Heart className="w-4 h-4 mr-2 text-pink-300" />
                24/7 Support
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="space-y-6">
            {/* Main Search Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-cyan-500" />
                  From *
                </label>
                <input
                  type="text"
                  name="originLocationCode"
                  value={searchParams.originLocationCode}
                  onChange={handleInputChange}
                  placeholder="SYD"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all group-hover:border-cyan-300"
                  required
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-cyan-500" />
                  To *
                </label>
                <input
                  type="text"
                  name="destinationLocationCode"
                  value={searchParams.destinationLocationCode}
                  onChange={handleInputChange}
                  placeholder="BKK"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all group-hover:border-cyan-300"
                  required
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-cyan-500" />
                  Departure *
                </label>
                <input
                  type="date"
                  name="departureDate"
                  value={searchParams.departureDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all group-hover:border-cyan-300"
                  required
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-1 text-cyan-500" />
                  Adults *
                </label>
                <select
                  name="adults"
                  value={searchParams.adults}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all group-hover:border-cyan-300"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Children
                </label>
                <select
                  name="children"
                  value={searchParams.children}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                >
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <select
                  name="travelClass"
                  value={searchParams.travelClass}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                >
                  <option value="ECONOMY">Economy</option>
                  <option value="PREMIUM_ECONOMY">Premium Economy</option>
                  <option value="BUSINESS">Business</option>
                  <option value="FIRST">First Class</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="currencyCode"
                  value={searchParams.currencyCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="AUD">AUD</option>
                  <option value="VND">VND</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={searchParams.maxPrice}
                  onChange={handleInputChange}
                  placeholder="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Results
                </label>
                <select
                  name="max"
                  value={searchParams.max}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="nonStop"
                    checked={searchParams.nonStop}
                    onChange={handleInputChange}
                    className="mr-2 text-cyan-400 focus:ring-cyan-400"
                  />
                  <span className="text-sm text-gray-700">Non-stop only</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-xl transition duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search Amazing Flights
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Flight Results */}
      {searchPerformed && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {loading
                ? "Searching flights..."
                : `Found ${flights.length} amazing flights`}
            </h2>
          </div>

          {/*Loading effect for more friendlier user experience */}
          {loading ? (
            <div className="grid grid-cols-1 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-lg p-8 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {flights.map((flight, index) => (
                <div
                  key={flight.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-cyan-200 transform hover:-translate-y-1"
                >
                  {/* Enhanced Flight Header */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl p-3 mr-4 shadow-lg">
                          <Plane className="w-6 h-6 text-white transform rotate-45" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            This flight has
                          </h3>
                          <div className="flex items-center space-x-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                flight.itineraries[0].segments.length > 1
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {flight.itineraries[0].segments.length > 1
                                ? `${
                                    flight.itineraries[0].segments.length - 1
                                  } stop(s)`
                                : "Direct flight"}
                            </span>
                            <div className="flex items-center text-yellow-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">
                                4.2
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                          {flight.price.total}{searchParams.currencyCode}
                        </div>
                        <div className="text-sm text-gray-600">per person</div>
                        <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Great Deal!
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Enhanced Flight Route */}
                    <div className="mb-6">
                      {flight.itineraries[0].segments.map(
                        (segment, segIndex) => (
                          <div key={segment.id} className="mb-6 last:mb-0">
                            <div className="flex items-center bg-gray-50 rounded-xl p-4 ">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                  {formatTime(segment.departure)}
                                </div>
                                <div className="text-lg font-semibold text-cyan-600 mb-1">
                                  {segment.departure.iataCode}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatDate(segment.departure)}
                                </div>
                              </div>

                              <div className="flex-1 flex items-center px-4">
                                <div className="flex-1 border-t-2 border-dashed border-cyan-300 relative">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-cyan-600 shadow-sm border">
                                      {formatDuration(segment.duration)}
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-cyan-400 rounded-full p-2 mx-2">
                                  <ArrowRight className="w-4 h-4 text-white" />
                                </div>
                              </div>

                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                  {formatTime(segment.arrival)}
                                </div>
                                <div className="text-lg font-semibold text-cyan-600 mb-1">
                                  {segment.arrival.iataCode}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatDate(segment.arrival)}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-center space-x-6 text-sm text-gray-600">
                              <span className="bg-blue-50 px-3 py-1 rounded-full">
                                Flight {segment.carrierCode} {segment.number}
                              </span>
                              <span className="bg-gray-50 px-3 py-1 rounded-full">
                                Airbus A330-300
                              </span>
                              {segment.departure.terminal && (
                                <span className="bg-purple-50 px-3 py-1 rounded-full">
                                  Terminal {segment.departure.terminal}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    {/* Enhanced Flight Details */}
                    <div className="flex justify-between gap-10 items-center pt-6 border-t border-gray-200">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
                          <Clock className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="font-medium">
                            Total:{" "}
                            {formatDuration(flight.itineraries[0].duration)}
                          </span>
                        </div>
                        <div className="flex items-center bg-green-50 px-3 py-2 rounded-lg">
                          <Users className="w-4 h-4 mr-2 text-green-600" />
                          <span className="font-medium">
                            {flight.numberOfBookableSeats} seats left
                          </span>
                        </div>
                        <div className="flex items-center bg-purple-50 px-3 py-2 rounded-lg">
                          <Shield className="w-4 h-4 mr-2 text-purple-600" />
                          <span className="font-medium">
                            25kg baggage included
                          </span>
                        </div>
                      </div>
                      <button className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center">
                        Select Flight
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && flights.length === 0 && searchPerformed && (
            <div className="text-center py-16">
              <div className="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                <Plane className="w-16 h-16 text-cyan-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No flights found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or explore different dates
              </p>
              <button className="bg-cyan-400 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold transition duration-200">
                Modify Search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlightSearchPage;
