"use client"

import Image, { ImageProps } from "next/image"
import { useState, useCallback, memo } from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallbackSrc?: string
  showSkeleton?: boolean
  aspectRatio?: "square" | "video" | "portrait" | "auto"
}

/**
 * Composant d'image optimisé avec:
 * - Chargement progressif avec skeleton
 * - Gestion des erreurs avec fallback
 * - Support des ratios d'aspect
 * - Blur placeholder automatique
 */
export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className,
  fallbackSrc = "/placeholder.png",
  showSkeleton = true,
  aspectRatio = "auto",
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleError = useCallback(() => {
    setError(true)
    setIsLoading(false)
  }, [])

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    auto: "",
  }

  const imageSrc = error ? fallbackSrc : src

  return (
    <div className={cn("relative overflow-hidden", aspectClasses[aspectRatio], className)}>
      {/* Skeleton de chargement */}
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse" />
      )}

      <Image
        src={imageSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  )
})

/**
 * Image de produit optimisée
 */
export const ProductImage = memo(function ProductImage({
  src,
  name,
  className,
  size = "md",
}: {
  src?: string | null
  name: string
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  }

  if (!src) {
    // Placeholder avec initiales
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

    return (
      <div
        className={cn(
          sizeClasses[size],
          "rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold",
          className
        )}
      >
        {initials}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={name}
      width={size === "sm" ? 40 : size === "md" ? 64 : 96}
      height={size === "sm" ? 40 : size === "md" ? 64 : 96}
      className={cn(sizeClasses[size], "rounded-lg object-cover", className)}
    />
  )
})

/**
 * Avatar utilisateur optimisé
 */
export const UserAvatar = memo(function UserAvatar({
  src,
  name,
  className,
  size = "md",
}: {
  src?: string | null
  name: string
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
  }

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  // Générer une couleur basée sur le nom
  const colors = [
    "from-red-500 to-pink-500",
    "from-orange-500 to-amber-500",
    "from-yellow-500 to-lime-500",
    "from-green-500 to-emerald-500",
    "from-teal-500 to-cyan-500",
    "from-blue-500 to-indigo-500",
    "from-indigo-500 to-purple-500",
    "from-purple-500 to-pink-500",
  ]
  const colorIndex = name.charCodeAt(0) % colors.length
  const bgColor = colors[colorIndex]

  if (!src) {
    return (
      <div
        className={cn(
          sizeClasses[size],
          `rounded-full bg-gradient-to-br ${bgColor} flex items-center justify-center text-white font-bold shadow-lg`,
          className
        )}
      >
        {initials}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={name}
      width={size === "sm" ? 32 : size === "md" ? 40 : 56}
      height={size === "sm" ? 32 : size === "md" ? 40 : 56}
      className={cn(sizeClasses[size], "rounded-full object-cover", className)}
    />
  )
})




