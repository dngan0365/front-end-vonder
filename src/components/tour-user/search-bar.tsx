"use client";

import type React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { getTours } from "@/api/tour";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchBarProps {
  className?: string;
  onSearchResults?: (results: any) => void; // Callback to pass results to parent
}

export function SearchBar({ className, onSearchResults }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      // Clear search if empty
      if (onSearchResults) {
        onSearchResults({ tours: [], pagination: { totalItems: 0 } });
      }
      return;
    }

    setIsLoading(true);
    
    try {
      // Option 1: Direct API call for immediate results
      if (onSearchResults) {
        const results = await getTours({
          q: searchQuery,
          page: 1,
          limit: 12
        });
        onSearchResults(results);
      } else {
        // Option 2: Navigate with URL parameters
        const params = new URLSearchParams(searchParams.toString());
        params.set("q", searchQuery);
        params.set("page", "1"); // Reset to first page
        router.push(`?${params.toString()}`);
      }
      
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (onSearchResults) {
      // Clear search results
      onSearchResults(null);
    } else {
      // Remove search from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("q");
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <Input
        type="text"
        placeholder="Search for tours, destinations, activities..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pr-20"
        disabled={isLoading}
      />
      <div className="absolute right-1 top-1 flex gap-1">
        {searchQuery && (
          <Button 
            type="button"
            onClick={handleClearSearch}
            size="icon" 
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            ✕
            <span className="sr-only">Clear search</span>
          </Button>
        )}
        <Button 
          type="submit" 
          size="icon" 
          className="h-8 w-8"
          disabled={isLoading || !searchQuery.trim()}
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    </form>
  );
}

export default SearchBar;