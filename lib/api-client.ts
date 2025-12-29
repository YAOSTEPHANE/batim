"use client"

/**
 * Client API optimisé avec:
 * - Cache automatique avec SWR-like pattern
 * - Retry automatique
 * - Déduplication des requêtes
 * - Gestion des erreurs
 */

// Cache en mémoire pour les requêtes
const requestCache = new Map<string, { data: any; timestamp: number; promise?: Promise<any> }>()

// Durée de cache par défaut (5 minutes)
const DEFAULT_CACHE_TIME = 5 * 60 * 1000

// Configuration
interface FetchConfig extends RequestInit {
  cacheTime?: number
  retries?: number
  retryDelay?: number
  dedupe?: boolean
}

/**
 * Fonction fetch optimisée avec cache et retry
 */
export async function fetchApi<T>(
  url: string,
  config: FetchConfig = {}
): Promise<T> {
  const {
    cacheTime = DEFAULT_CACHE_TIME,
    retries = 3,
    retryDelay = 1000,
    dedupe = true,
    ...fetchConfig
  } = config

  const cacheKey = `${url}-${JSON.stringify(fetchConfig)}`
  const now = Date.now()

  // Vérifier le cache pour les requêtes GET
  if (fetchConfig.method === undefined || fetchConfig.method === "GET") {
    const cached = requestCache.get(cacheKey)
    
    // Retourner les données cachées si valides
    if (cached && now - cached.timestamp < cacheTime) {
      return cached.data
    }

    // Déduplication: retourner la promesse en cours si elle existe
    if (dedupe && cached?.promise) {
      return cached.promise
    }
  }

  // Créer la fonction de fetch avec retry
  const doFetch = async (attempt: number = 0): Promise<T> => {
    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers: {
          "Content-Type": "application/json",
          ...fetchConfig.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.error || `HTTP ${response.status}`,
          response.status,
          errorData
        )
      }

      const data = await response.json()

      // Mettre en cache pour les requêtes GET
      if (fetchConfig.method === undefined || fetchConfig.method === "GET") {
        requestCache.set(cacheKey, { data, timestamp: Date.now() })
      }

      return data
    } catch (error) {
      // Retry pour les erreurs réseau ou 5xx
      if (
        attempt < retries &&
        (error instanceof TypeError || // Erreur réseau
          (error instanceof ApiError && error.status >= 500))
      ) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)))
        return doFetch(attempt + 1)
      }
      throw error
    }
  }

  // Stocker la promesse pour déduplication
  const promise = doFetch()
  
  if (dedupe && (fetchConfig.method === undefined || fetchConfig.method === "GET")) {
    requestCache.set(cacheKey, { 
      data: null, 
      timestamp: now, 
      promise 
    })
  }

  return promise
}

/**
 * Classe d'erreur API personnalisée
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/**
 * Invalider le cache pour une URL
 */
export function invalidateCache(urlPattern?: string) {
  if (!urlPattern) {
    requestCache.clear()
    return
  }

  for (const key of requestCache.keys()) {
    if (key.includes(urlPattern)) {
      requestCache.delete(key)
    }
  }
}

/**
 * Précharger des données
 */
export function prefetch(url: string, config?: FetchConfig) {
  fetchApi(url, config).catch(() => {
    // Ignorer les erreurs de préchargement
  })
}

// ==================== API Helpers ====================

/**
 * Récupérer les produits avec pagination
 */
export async function getProducts(params?: {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", params.page.toString())
  if (params?.limit) searchParams.set("limit", params.limit.toString())
  if (params?.search) searchParams.set("search", params.search)
  if (params?.categoryId) searchParams.set("categoryId", params.categoryId)

  return fetchApi<{
    products: any[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }>(`/api/products?${searchParams}`)
}

/**
 * Récupérer les clients
 */
export async function getClients(params?: {
  status?: string
  search?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set("status", params.status)
  if (params?.search) searchParams.set("search", params.search)

  return fetchApi<any[]>(`/api/clients?${searchParams}`)
}

/**
 * Récupérer les ventes impayées
 */
export async function getUnpaidSales(params?: {
  filter?: string
  clientId?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.filter) searchParams.set("filter", params.filter)
  if (params?.clientId) searchParams.set("clientId", params.clientId)

  return fetchApi<any[]>(`/api/sales/unpaid?${searchParams}`, {
    cacheTime: 30000, // 30 secondes pour les données temps réel
  })
}

/**
 * Créer une vente
 */
export async function createSale(data: any) {
  const result = await fetchApi<any>("/api/sales", {
    method: "POST",
    body: JSON.stringify(data),
  })

  // Invalider les caches liés
  invalidateCache("/api/sales")
  invalidateCache("/api/products")
  invalidateCache("/api/clients")

  return result
}

/**
 * Enregistrer un paiement
 */
export async function createPayment(data: any) {
  const result = await fetchApi<any>("/api/payments", {
    method: "POST",
    body: JSON.stringify(data),
  })

  // Invalider les caches liés
  invalidateCache("/api/sales")
  invalidateCache("/api/clients")
  invalidateCache("/api/payments")

  return result
}

// ==================== SWR-like Hook ====================

import { useState, useEffect, useCallback, useRef } from "react"

interface UseFetchOptions<T> {
  initialData?: T
  cacheTime?: number
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
  refreshInterval?: number
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

/**
 * Hook pour les requêtes API avec cache et revalidation
 */
export function useFetch<T>(
  url: string | null,
  options: UseFetchOptions<T> = {}
) {
  const {
    initialData,
    cacheTime = DEFAULT_CACHE_TIME,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    refreshInterval,
    onSuccess,
    onError,
  } = options

  const [data, setData] = useState<T | undefined>(initialData)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(!initialData && !!url)
  const [isValidating, setIsValidating] = useState(false)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async () => {
    if (!url) return

    setIsValidating(true)
    try {
      const result = await fetchApi<T>(url, { cacheTime })
      if (mountedRef.current) {
        setData(result)
        setError(null)
        onSuccess?.(result)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error)
        onError?.(err as Error)
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
        setIsValidating(false)
      }
    }
  }, [url, cacheTime, onSuccess, onError])

  // Fetch initial
  useEffect(() => {
    mountedRef.current = true
    fetchData()
    return () => {
      mountedRef.current = false
    }
  }, [fetchData])

  // Revalidation sur focus
  useEffect(() => {
    if (!revalidateOnFocus) return

    const handleFocus = () => {
      fetchData()
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [revalidateOnFocus, fetchData])

  // Revalidation sur reconnexion
  useEffect(() => {
    if (!revalidateOnReconnect) return

    const handleOnline = () => {
      fetchData()
    }

    window.addEventListener("online", handleOnline)
    return () => window.removeEventListener("online", handleOnline)
  }, [revalidateOnReconnect, fetchData])

  // Refresh interval
  useEffect(() => {
    if (!refreshInterval) return

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval, fetchData])

  const mutate = useCallback((newData?: T | ((current: T | undefined) => T)) => {
    if (typeof newData === "function") {
      setData((current) => (newData as (current: T | undefined) => T)(current))
    } else if (newData !== undefined) {
      setData(newData)
    } else {
      fetchData()
    }
  }, [fetchData])

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    refetch: fetchData,
  }
}




