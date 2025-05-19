export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Skeleton for hero section */}
      <div className="relative w-full h-[50vh] md:h-[60vh] bg-gray-300 animate-pulse">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <div className="h-12 w-3/4 max-w-md bg-gray-400 rounded-lg mb-4"></div>
          <div className="h-6 w-1/2 max-w-sm bg-gray-400 rounded-lg"></div>
        </div>
      </div>

      {/* Skeleton for content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Location metadata skeleton */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-32 bg-gray-300 rounded-full animate-pulse"></div>
          ))}
        </div>

        {/* Social sharing skeleton */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
          ))}
        </div>

        {/* Main description skeleton */}
        <div className="space-y-4">
          <div className="h-6 bg-gray-300 rounded w-full animate-pulse"></div>
          <div className="h-6 bg-gray-300 rounded w-full animate-pulse"></div>
          <div className="h-6 bg-gray-300 rounded w-5/6 animate-pulse"></div>
          <div className="h-6 bg-gray-300 rounded w-full animate-pulse"></div>
          <div className="h-6 bg-gray-300 rounded w-4/5 animate-pulse"></div>
        </div>

        {/* Additional information skeleton */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-200 p-6 rounded-lg h-64 animate-pulse"></div>
          <div className="bg-gray-200 p-6 rounded-lg h-64 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

