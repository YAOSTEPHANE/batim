"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  ShoppingCart,
  Truck,
  BarChart3,
  Sparkles
} from "lucide-react"
import { PurchasesList } from "@/components/purchases/purchases-list"
import { PurchaseDialog } from "@/components/purchases/purchase-dialog"
import { formatCurrency } from "@/lib/utils"

interface PurchaseStats {
  total: number
  pending: number
  received: number
  cancelled: number
  totalAmount: number
  pendingAmount: number
}

export default function PurchasesPage() {
  const { data: session, status } = useSession()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<PurchaseStats>({
    total: 0,
    pending: 0,
    received: 0,
    cancelled: 0,
    totalAmount: 0,
    pendingAmount: 0
  })

  useEffect(() => {
    setMounted(true)
    fetchStats()
  }, [refreshKey])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/purchases")
      if (response.ok) {
        const data = await response.json()
        const pending = data.filter((p: any) => p.status === "PENDING")
        const received = data.filter((p: any) => p.status === "RECEIVED")
        const cancelled = data.filter((p: any) => p.status === "CANCELLED")
        
        setStats({
          total: data.length,
          pending: pending.length,
          received: received.length,
          cancelled: cancelled.length,
          totalAmount: data.reduce((acc: number, p: any) => acc + p.totalAmount, 0),
          pendingAmount: pending.reduce((acc: number, p: any) => acc + p.totalAmount, 0)
        })
      }
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error)
    }
  }

  if (status === "loading") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full min-h-screen">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <Package className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!session) {
    redirect("/login")
  }

  const userRole = session.user.role
  if (userRole !== "ADMIN" && userRole !== "STOCK_MANAGER") {
    redirect("/dashboard")
  }

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  // Workflow steps
  const workflowSteps = [
    { 
      icon: ShoppingCart, 
      label: "Commande", 
      description: "Créer le bon",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      count: stats.total
    },
    { 
      icon: Clock, 
      label: "En attente", 
      description: "Livraison prévue",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      count: stats.pending
    },
    { 
      icon: Truck, 
      label: "Livraison", 
      description: "En cours",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      count: 0
    },
    { 
      icon: CheckCircle, 
      label: "Reçue", 
      description: "Stock mis à jour",
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-50",
      count: stats.received
    },
  ]

  return (
    <MainLayout>
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/40 p-6 space-y-6 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Header avec effet glassmorphism */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-8 text-white shadow-2xl">
          {/* Éléments décoratifs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Package className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Achats & Commandes</h1>
                  <p className="text-purple-100 mt-1 text-lg">
                    Gérez vos bons de commande et suivez les livraisons fournisseurs
                  </p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setDialogOpen(true)}
              className="bg-white text-purple-600 hover:bg-purple-50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl px-6 py-6 text-lg font-semibold rounded-xl"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nouveau bon de commande
            </Button>
          </div>
        </div>

        {/* Workflow visuel */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-purple-50/50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              Workflow des Commandes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="relative">
              {/* Ligne de connexion */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-emerald-200 transform -translate-y-1/2 rounded-full"></div>
              
              <div className="relative grid grid-cols-4 gap-4">
                {workflowSteps.map((step, index) => (
                  <div 
                    key={index}
                    className={`flex flex-col items-center transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <div className={`relative z-10 p-4 rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 cursor-pointer group`}>
                      <step.icon className="h-8 w-8 group-hover:animate-pulse" />
                      {step.count > 0 && (
                        <span className="absolute -top-2 -right-2 bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded-full shadow-md">
                          {step.count}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 text-center">
                      <p className="font-semibold text-gray-800">{step.label}</p>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Commandes */}
          <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Commandes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Ce mois
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <ShoppingCart className="h-7 w-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* En Attente */}
          <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">En Attente</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
                  <p className="text-sm text-amber-600 mt-2">
                    {formatCurrency(stats.pendingAmount)}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Clock className="h-7 w-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reçues */}
          <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/5"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Reçues</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.received}</p>
                  <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Stock mis à jour
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <CheckCircle className="h-7 w-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Montant Total */}
          <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/5"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Montant Total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalAmount)}</p>
                  <p className="text-sm text-purple-600 mt-2 flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    Toutes commandes
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <TrendingUp className="h-7 w-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des commandes */}
        <Card className={`border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '500ms' }}>
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 via-purple-50/30 to-blue-50/30">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg text-white">
                  <Package className="h-5 w-5" />
                </div>
                Bons de Commande
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {stats.total} commandes
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <PurchasesList key={refreshKey} onRefresh={handleSuccess} />
          </CardContent>
        </Card>
      </div>

      <PurchaseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </MainLayout>
  )
}
