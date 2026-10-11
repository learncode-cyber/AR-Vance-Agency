'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { X, Upload, Trash2 } from 'lucide-react'

interface GalleryImage {
  id: string
  url: string
  alt?: string
  uploadedAt: string
}

interface ProjectGalleryProps {
  images: GalleryImage[]
  projectId: string
  onImageUpload?: (file: File) => Promise<void>
  onImageDelete?: (imageId: string) => Promise<void>
  editable?: boolean
}

export function ProjectGallery({
  images,
  projectId,
  onImageUpload,
  onImageDelete,
  editable = false
}: ProjectGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onImageUpload) return

    try {
      setIsLoading(true)
      await onImageUpload(file)
    } catch (error) {
      console.error('Failed to upload image:', error)
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  const handleImageDelete = async (imageId: string) => {
    if (!onImageDelete) return

    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      setIsLoading(true)
      await onImageDelete(imageId)
    } catch (error) {
      console.error('Failed to delete image:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Project Gallery</h3>
        {editable && (
          <label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isLoading}
              className="hidden"
            />
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <span className="cursor-pointer">
                <Upload size={16} className="mr-1" />
                {isLoading ? 'Uploading...' : 'Upload Image'}
              </span>
            </Button>
          </label>
        )}
      </div>

      {/* Gallery Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group rounded-lg overflow-hidden"
            >
              <div className="relative w-full aspect-square bg-gray-200 cursor-pointer">
                <Image
                  src={image.url}
                  alt={image.alt || 'Project image'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onClick={() => setSelectedImage(image)}
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setSelectedImage(image)}
                >
                  🔍
                </Button>
                {editable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleImageDelete(image.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>

              {/* Metadata */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs">
                  {new Date(image.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No images in gallery yet</p>
          {editable && (
            <p className="text-sm text-gray-500 mt-1">Click "Upload Image" to get started</p>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="relative w-full aspect-auto bg-gray-900 rounded-lg overflow-hidden">
              <Image
                src={selectedImage.url}
                alt={selectedImage.alt || 'Project image'}
                width={1200}
                height={800}
                className="w-full h-auto"
              />
            </div>

            {/* Image Info */}
            <div className="bg-gray-900 text-white p-4 rounded-b-lg">
              {selectedImage.alt && (
                <p className="font-semibold mb-1">{selectedImage.alt}</p>
              )}
              <p className="text-sm text-gray-400">
                Uploaded {new Date(selectedImage.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
