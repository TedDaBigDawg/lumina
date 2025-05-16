"use client"

import { useState, useEffect } from "react"
import NextImage, { type ImageProps as NextImageProps } from "next/image"
import { cn } from "@/lib/utils"

interface ImageProps extends NextImageProps {
  fallback?: string
  aspectRatio?: number
}

export function Image({ src, alt, className, fallback = "/placeholder.svg", aspectRatio, ...props }: ImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [blurDataURL, setBlurDataURL] = useState<string | undefined>(undefined)

  // Generate a simple blur placeholder if not provided
  useEffect(() => {
    if (!props.placeholder && !props.blurDataURL && typeof src === "string") {
      // Create a simple colored blur placeholder
      const canvas = document.createElement("canvas")
      canvas.width = 10
      canvas.height = 10
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "#e2e8f0" // A light gray color
        ctx.fillRect(0, 0, 10, 10)
        setBlurDataURL(canvas.toDataURL())
      }
    }
  }, [src, props.placeholder, props.blurDataURL])

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        aspectRatio && `aspect-w-${Math.floor(aspectRatio * 100)} aspect-h-100`,
        className,
      )}
      style={aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined}
    >
      <NextImage
        src={error ? fallback : src}
        alt={alt}
        className={cn("transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100")}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => {
          setError(true)
          setIsLoading(false)
        }}
        placeholder={blurDataURL ? "blur" : props.placeholder}
        blurDataURL={blurDataURL || props.blurDataURL}
        {...props}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <span className="sr-only">Loading...</span>
        </div>
      )}
    </div>
  )
}

