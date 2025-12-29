import { unstable_cache } from "next/cache"
import { cache } from "react"

/**
 * Cache avancé pour les données de l'application
 * Utilise unstable_cache de Next.js pour le caching côté serveur
 */

// Tags de cache pour l'invalidation
export const CACHE_TAGS = {
  DASHBOARD: "dashboard",
  PRODUCTS: "products",
  SALES: "sales",
  CLIENTS: "clients",
  PURCHASES: "purchases",
  REPORTS: "reports",
  USERS: "users",
  SETTINGS: "settings",
} as const

// Durées de cache en secondes
export const CACHE_DURATIONS = {
  SHORT: 30,      // 30 secondes - données temps réel
  MEDIUM: 60 * 5, // 5 minutes - données fréquemment mises à jour
  LONG: 60 * 15,  // 15 minutes - données rarement mises à jour
  STATIC: 60 * 60, // 1 heure - données quasi-statiques
} as const

/**
 * Wrapper pour créer des fonctions cachées avec revalidation
 */
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    tags: string[]
    revalidate?: number
    keyParts?: string[]
  }
) {
  return unstable_cache(fn, options.keyParts || [], {
    tags: options.tags,
    revalidate: options.revalidate || CACHE_DURATIONS.MEDIUM,
  })
}

/**
 * Cache de requête React (déduplication dans une seule requête)
 */
export const requestCache = cache

/**
 * Fonction pour invalider le cache par tag
 */
export async function revalidateCache(tag: string) {
  const { revalidateTag } = await import("next/cache")
  revalidateTag(tag)
}

/**
 * Fonction pour invalider plusieurs tags
 */
export async function revalidateCaches(tags: string[]) {
  const { revalidateTag } = await import("next/cache")
  tags.forEach((tag) => revalidateTag(tag))
}




