import { getLocationById } from "@/app/api/location"
import { Facebook, Mail, MapPin, Navigation, Share2, Tag, Twitter } from "lucide-react"
import Image from "next/image"
import { notFound } from "next/navigation"

export default async function LocationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  try {
    const location = await getLocationById(params.id)

    return (
      <div className="flex flex-col min-h-screen">
        {/* Hero section with cover image and title */}
        <div className="relative w-full h-[80vh] md:h-[80vh]">
          <div className="absolute inset-0">
            <Image
              src={location.coverImage || "/placeholder.svg"}
              alt={location.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white font-serif tracking-wide">{location.name}</h1>
          </div>
        </div>

        {/* Content section */}
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Location metadata */}
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full">
              <MapPin className="h-5 w-5 text-amber-600" />
              <span>{location.province}</span>
              {location.district && <span>- {location.district}</span>}
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
              <Tag className="h-5 w-5 text-emerald-600" />
              <span>{location.category}</span>
            </div>
          </div>

          {/* Social sharing */}
          <div className="flex justify-center gap-2 mb-8">
            <button
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
              aria-label="Share on Facebook"
            >
              <Facebook size={16} />
            </button>
            <button
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors"
              aria-label="Share on Twitter"
            >
              <Twitter size={16} />
            </button>
            <button
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
              aria-label="Share on Pinterest"
            >
              <Share2 size={16} />
            </button>
            <button
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors"
              aria-label="Share via Email"
            >
              <Mail size={16} />
            </button>
          </div>

          {/* Main description */}
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-gray-700 mb-6 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: location.description }}
            />
          </div>

          {/* Additional information can be added here */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-amber-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Location Details</h3>
              <ul className="space-y-2">
                <li>
                  <span className="font-medium">Province:</span> {location.province}
                </li>
                {location.district && (
                  <li>
                    <span className="font-medium">District:</span> {location.district}
                  </li>
                )}
                {location.latitude && location.longitude && (
                  <li>
                    <span className="font-medium">Coordinates:</span> {location.latitude.toFixed(6)},{" "}
                    {location.longitude.toFixed(6)}
                  </li>
                )}
                <li>
                  <span className="font-medium">Category:</span> {location.category}
                </li>
              </ul>
            </div>

            <div className="bg-emerald-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Visit Information</h3>
              <p>
                This is a popular {location.category.toLowerCase()} destination in {location.province}. Plan your visit
                to experience the natural beauty and cultural significance of this location.
              </p>
              <button className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors">
                Plan Your Visit
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching location:", error)
    notFound()
  }
}

