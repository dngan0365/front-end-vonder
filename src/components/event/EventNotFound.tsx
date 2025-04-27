import Link from 'next/link';

export default function EventNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Event Not Found</h1>
        <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Link href="/events" className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-6 py-3 rounded-md transition">
          Browse Events
        </Link>
      </div>
    </div>
  );
}