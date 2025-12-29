"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { UnpaidSalesList } from "@/components/unpaid/unpaid-sales-list"
import { 
  AlertTriangle, 
  Shield, 
  TrendingDown,
  Bell,
  Sparkles
} from "lucide-react"
import { useState, useEffect } from "react"

export default function UnpaidPage() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (status === "loading") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full min-h-screen">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            <AlertTriangle className="w-8 h-8 text-red-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!session) {
    redirect("/login")
  }

  const userRole = (session.user as any).role
  if (userRole !== "ADMIN" && userRole !== "STOCK_MANAGER") {
    redirect("/dashboard")
  }

  return (
    <MainLayout>
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-red-50/20 to-orange-50/30 p-6 space-y-6 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Header avec effet glassmorphism */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 p-8 text-white shadow-2xl">
          {/* Éléments décoratifs animés */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-400/20 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-orange-400/20 rounded-full blur-xl animate-bounce" style={{ animationDuration: '3s' }}></div>
          
          {/* Icône d'alerte animée */}
          <div className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-sm rounded-full animate-pulse">
            <Bell className="h-6 w-6 text-white" />
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl animate-bounce" style={{ animationDuration: '2s' }}>
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
                    Gestion des Impayés
                    <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
                  </h1>
                  <p className="text-red-100 mt-1 text-lg">
                    Suivi des ventes à crédit et recouvrement des dettes clients
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Badges d'information */}
          <div className="relative z-10 flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Recouvrement actif</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium">Objectif: &lt;2% impayés</span>
            </div>
          </div>
        </div>

        {/* Alerte visuelle si impayés critiques */}
        <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 p-4">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y5N2MxNiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-3 bg-amber-500 rounded-xl text-white animate-pulse">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800">Rappel: Règles de blocage automatique</h3>
                <p className="text-amber-700 text-sm">
                  Les clients avec des factures impayées depuis plus de 90 jours sont automatiquement bloqués pour les ventes à crédit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des impayés */}
        <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
          <UnpaidSalesList />
        </div>
      </div>
    </MainLayout>
  )
}
