"use client";
import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";

export default function MyPage() {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/map/Map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    []
  );

  return (
    <div>
      <Map
        position={[16.5, 107.5]}
        zoom={6}
      />
    </div>
  );
}
