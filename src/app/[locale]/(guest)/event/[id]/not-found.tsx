import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h2 className="text-3xl font-bold mb-4">Location Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        We couldn't find the location you're looking for. It may have been removed or the URL might be incorrect.
      </p>
      <Link
        href="/locations"
        className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
      >
        Browse All Locations
      </Link>
    </div>
  )
}

