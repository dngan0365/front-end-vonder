"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, X } from "lucide-react"
import ImageUploader from "./ImageUploader"

interface MultiImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function MultiImageUploader({ images = [], onChange, maxImages = 5 }: MultiImageUploaderProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const handleAddImage = () => {
    if (images.length < maxImages) {
      const newImages = [...images, ""]
      onChange(newImages)
      setActiveIndex(newImages.length - 1)
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onChange(newImages)
    setActiveIndex(null)
  }

  const handleImageChange = (index: number, url: string) => {
    const newImages = [...images]
    newImages[index] = url
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {images.map((url, index) => (
          <Card
            key={index}
            className={`overflow-hidden relative cursor-pointer ${activeIndex === index ? "ring-2 ring-primary" : ""}`}
            onClick={() => setActiveIndex(index)}
          >
            <CardContent className="p-0">
              <div className="relative aspect-square">
                {url ? (
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Tour image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveImage(index)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}

        {images.length < maxImages && (
          <Card className="border-dashed cursor-pointer" onClick={handleAddImage}>
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center w-full h-full aspect-square">
                <Plus className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Add Image</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {activeIndex !== null && (
        <div className="mt-4 p-4 border rounded-md">
          <h4 className="font-medium mb-2">Edit Image {activeIndex + 1}</h4>
          <ImageUploader
            currentImage={images[activeIndex] || ""}
            onImageChange={(url) => handleImageChange(activeIndex, url)}
            label={`Tour image ${activeIndex + 1}`}
          />
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        {images.filter(Boolean).length} of {maxImages} images uploaded
      </p>
    </div>
  )
}
