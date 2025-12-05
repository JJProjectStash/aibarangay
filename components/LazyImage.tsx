import React, { useState, useRef, useEffect } from "react";
import { cn } from "./UI";
import { ImageOff, Loader2 } from "lucide-react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  placeholderClassName?: string;
  containerClassName?: string;
  aspectRatio?: "square" | "video" | "auto";
  objectFit?: "cover" | "contain" | "fill";
}

/**
 * LazyImage Component
 * Implements lazy loading using Intersection Observer for better performance.
 * Shows loading skeleton and handles image load errors gracefully.
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallback,
  className,
  placeholderClassName,
  containerClassName,
  aspectRatio = "auto",
  objectFit = "cover",
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Aspect ratio classes
  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  };

  // Object fit classes
  const objectFitClasses = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px", // Start loading 50px before element enters viewport
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
  };

  const handleError = () => {
    setIsError(true);
    setIsLoaded(true);
  };

  // Use fallback or placeholder if error
  const imageSrc = isError && fallback ? fallback : src;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-gray-100",
        aspectRatioClasses[aspectRatio],
        containerClassName
      )}
    >
      {/* Loading skeleton */}
      {!isLoaded && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse",
            placeholderClassName
          )}
        >
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Error state */}
      {isError && !fallback && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
          <ImageOff className="w-8 h-8 mb-2" />
          <span className="text-xs">Image not available</span>
        </div>
      )}

      {/* Actual image - only loads when in viewport */}
      {isInView && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full transition-opacity duration-300",
            objectFitClasses[objectFit],
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

/**
 * Avatar component with lazy loading and fallback
 */
interface LazyAvatarProps {
  src?: string;
  alt: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const LazyAvatar: React.FC<LazyAvatarProps> = ({
  src,
  alt,
  name,
  size = "md",
  className,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  // Generate initials from name
  const getInitials = () => {
    if (!name) return "?";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0]?.substring(0, 2).toUpperCase() || "?";
  };

  // Generate a consistent color based on name
  const getColorClass = () => {
    if (!name) return "bg-gray-400";
    const colors = [
      "bg-primary-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-sky-500",
      "bg-purple-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const showFallback = isError || !src;

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden flex items-center justify-center font-semibold text-white",
        sizeClasses[size],
        showFallback ? getColorClass() : "bg-gray-200",
        className
      )}
    >
      {showFallback ? (
        <span>{getInitials()}</span>
      ) : (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <img
            src={src}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            onError={() => setIsError(true)}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-200",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            loading="lazy"
          />
        </>
      )}
    </div>
  );
};

export default LazyImage;
