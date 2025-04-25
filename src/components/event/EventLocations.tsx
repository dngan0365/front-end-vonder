import { MapPin } from 'lucide-react';

type Location = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
};

type EventLocation = {
  id: string;
  description: string | null;
  location: Location;
};

type EventLocationsProps = {
  locations: EventLocation[];
};

export default function EventLocations({ locations }: EventLocationsProps) {
  return (
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-3">Location{locations.length > 1 ? 's' : ''}</h2>
      
      <div className="space-y-4">
        {locations.map((eventLocation) => (
          <div key={eventLocation.id} className="border-l-4 border-cyan-400 pl-4 py-2">
            <div className="flex items-start">
              <MapPin size={18} className="text-cyan-400 mt-1 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-medium">{eventLocation.location.name}</h3>
                <p className="text-gray-600">
                  {eventLocation.location.address}, {eventLocation.location.city}, {eventLocation.location.country}
                </p>
                {eventLocation.description && (
                  <p className="text-gray-700 mt-2">{eventLocation.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}