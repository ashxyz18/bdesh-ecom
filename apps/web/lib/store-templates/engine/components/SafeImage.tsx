"use client"

import Image from "next/image"

interface SafeImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  className?: string
  priority?: boolean
  [key: string]: any
}

/**
 * Optimized image component that enforces alt tags and lazy loading.
 * Uses Next.js Image when possible, falls back to img with loading="lazy".
 */
export function SafeImage({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  className = "",
  priority = false,
  ...rest
}: SafeImageProps) {
  if (!src) return null

  // Use Next.js Image for optimization (auto WebP/AVIF, lazy loading)
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt || "Product image"}
        fill
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        className={className}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        {...rest}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt || "Product image"}
      width={width || 800}
      height={height || 600}
      className={className}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      {...rest}
    />
  )
}

/**
 * For plain img tags that need quick replacement - enforces alt and lazy loading
 */
export function SafeImg({
  src,
  alt,
  className = "",
  ...rest
}: {
  src: string
  alt: string
  className?: string
  [key: string]: any
}) {
  return (
    <img
      src={src}
      alt={alt || "Image"}
      loading="lazy"
      className={className}
      {...rest}
    />
  )
}
