"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"

interface UseVirtualListOptions<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
}

interface VirtualItem<T> {
  index: number
  item: T
  style: React.CSSProperties
}

/**
 * Hook pour la virtualisation des longues listes
 * Améliore les performances en ne rendant que les éléments visibles
 */
export function useVirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
}: UseVirtualListOptions<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculer les indices visibles
  const { startIndex, endIndex, virtualItems, totalHeight } = useMemo(() => {
    const totalHeight = items.length * itemHeight
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.floor(scrollTop / itemHeight) + visibleCount + overscan
    )

    const virtualItems: VirtualItem<T>[] = []
    for (let i = startIndex; i <= endIndex; i++) {
      virtualItems.push({
        index: i,
        item: items[i],
        style: {
          position: "absolute",
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        },
      })
    }

    return { startIndex, endIndex, virtualItems, totalHeight }
  }, [items, itemHeight, containerHeight, scrollTop, overscan])

  // Gestionnaire de scroll optimisé
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Scroll vers un index
  const scrollToIndex = useCallback(
    (index: number, align: "start" | "center" | "end" = "start") => {
      if (!containerRef.current) return

      let top = index * itemHeight
      if (align === "center") {
        top -= containerHeight / 2 - itemHeight / 2
      } else if (align === "end") {
        top -= containerHeight - itemHeight
      }

      containerRef.current.scrollTop = Math.max(0, top)
    },
    [itemHeight, containerHeight]
  )

  return {
    containerRef,
    virtualItems,
    totalHeight,
    handleScroll,
    scrollToIndex,
    startIndex,
    endIndex,
  }
}

/**
 * Hook pour la pagination infinie
 */
export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200,
}: {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  threshold?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      if (isLoading || !hasMore) return

      const { scrollTop, scrollHeight, clientHeight } = container
      if (scrollHeight - scrollTop - clientHeight < threshold) {
        onLoadMore()
      }
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [hasMore, isLoading, onLoadMore, threshold])

  return containerRef
}

/**
 * Hook pour le debounce des recherches
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook pour le throttle des événements
 */
export function useThrottle<T>(value: T, limit: number = 100): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}




