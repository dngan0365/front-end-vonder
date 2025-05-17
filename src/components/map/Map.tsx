"use client";
import { useEffect } from "react";
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
import Script from "next/script";
import geojsonData from "./custom.geo.json"; // Load Vietnam shape
import MapLayout from "@/app/[locale]/(guest)/map/layout";
import popupData from "./popup-data.json";

//the type of varibles in pop up data
type PopupData = {
  lat: number;
  lng: number;
  title: string;
  description: string;
  time: string; //format "dd/MM" work like a string
};

//function use for controlling the drag action if the user zoom in
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

export default function MyMap(props: any) {
  const { position, zoom } = props;

  const overlayStyle = {
    fillColor: "black", // Color outside Vietnam
    fillOpacity: 0.6, // 0.6 transparency
    color: "black",
    weight: 1,
  };

  function createPopup(item: PopupData, index: number) {
    return (
      <Marker key={index} position={{ lat: item.lat, lng: item.lng }}>
        <Popup>
        <h2 className="font-bold">{item.title}</h2>
        <p>{item.description}</p>
        <a href={`/locations/cm910ngcg0005k5110e7n6mie`}>Xem sự kiện</a>
        <p><strong>Event Time:</strong> {item.time}</p>
        </Popup>
      </Marker>
    );
  }

  return (
    // it needs height and width for the map to show
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
      
      {popupData.map((item: PopupData, index: number) => {
        // Get current date in "dd/MM" format
        const today = new Date().toLocaleDateString("en-GB"); // 'en-GB' gives "dd/MM/yyyy" format
        const currentDate = today.slice(0, 5);
        // destructering 
        // string method split
        // map array method 
        // call back function
        const [currentDay, currentMonth] = currentDate.split('/').map(Number); //constructor
        const [eventDay, eventMonth] = item.time.split('/').map(Number);
      
        const thisYear = new Date().getFullYear();

        // convert to date object
        const currentDateObj = new Date(thisYear, currentMonth - 1, currentDay); 
        const eventDateObj = new Date(thisYear, eventMonth - 1, eventDay);

        // Check if event date is today
        if (currentDateObj <= eventDateObj) {
          return createPopup(item, index); // Display popup if event is today
        } else {
          return null; // 1. "null"-object know type but no value  2."undefined" no type, no value - class object 3."NaN" not a number- type number but no value
        }
      })}

      <GeoJSON data={geojsonData} style={overlayStyle} />
      <DragControl />
    </MapContainer>
  );
}
