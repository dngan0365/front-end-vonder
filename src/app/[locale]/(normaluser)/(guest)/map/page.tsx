// pages/map/page.tsx or wherever you want to use the map
"use client";
import { useState } from "react";
import MyMap from "@/components/map/Map"; // Update with correct path

export default function MapPage() {
  const [searchParams, setSearchParams] = useState({
    category: 'all',
    search: '',
    limit: 100
  });

  const handleCategoryChange = (category: string) => {
    setSearchParams(prev => ({ ...prev, category }));
  };

  const handleSearchChange = (search: string) => {
    setSearchParams(prev => ({ ...prev, search }));
  };

  return (
    <div className="w-full">
      {/* Filter Controls */}
      <div className="bg-white p-4 shadow-sm border-b">
        <div className="max-w-6xl mx-auto flex gap-4 items-center">
          <div className="flex gap-2">
            <select 
              value={searchParams.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Tất cả</option>
              <option value="historical">Lịch sử</option>
              <option value="cultural">Văn hóa</option>
              <option value="natural">Tự nhiên</option>
              <option value="urban">Đô thị</option>
            </select>
          </div>
          
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm địa điểm..."
              value={searchParams.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Map Component */}
      <MyMap 
        position={[16.5, 107.5]} // Center of Vietnam
        zoom={6}
        searchParams={searchParams}
      />
    </div>
  );
}