"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Clock,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Package,
  CreditCard,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  RefreshCw,
  DollarSign,
  FileText,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface SaleItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  total: number
  product: {
    name: string
  }
}

interface PendingSale {
  id: string
  saleNumber: string
  total: number
  remainingAmount: number
  dueDate: string | null
  createdAt: string
  client: {
    name: string
    phone: string
  } | null
  items: SaleItem[]
}

export default function PendingSalesPage() {
  const [sales, setSales] = useState<PendingSale[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/sales/pending")
      if (response.ok) {
        const data = await response.json()
        setSales(data)
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les ventes en attente",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (saleId: string) => {
    setProcessingId(saleId)
    try {
      const response = await fetch(`/api/sales/${saleId}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Vente approuvée",
          description: "La vente a été validée avec succès",
        })
        fetchSales()
      } else {
        const error = await response.json()
        toast({
          title: "Erreur",
          description: error.error || "Impossible d'approuver la vente",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (saleId: string) => {
    setProcessingId(saleId)
    try {
      const response = await fetch(`/api/sales/${saleId}/reject`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Vente rejetée",
          description: "La vente a été annulée",
        })
        fetchSales()
      } else {
        const error = await response.json()
        toast({
          title: "Erreur",
          description: error.error || "Impossible de rejeter la vente",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const totalPending = sales.reduce((sum, sale) => sum + sale.total, 0)
  const totalCredit = sales.reduce((sum, sale) => sum + sale.remainingAmount, 0)

  if (!mounted) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 p-6">
        {/* Header */}
        <div className="relative mb-8">
          <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 dark:border-white/20 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/30">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Ventes en Attente d'Approbation
                  </h1>
                  <p className="text-gray-600 dark:text-white/60 mt-1">
                    Ventes à crédit nécessitant une validation administrateur
                  </p>
                </div>
              </div>
              <Button
                onClick={fetchSales}
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6" />
                  <div>
                    <p className="text-amber-100 text-sm">Ventes en attente</p>
                    <p className="text-3xl font-bold">{sales.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-6 w-6" />
                  <div>
                    <p className="text-orange-100 text-sm">Montant total</p>
                    <p className="text-2xl font-bold">
                      {totalPending.toLocaleString()} F
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6" />
                  <div>
                    <p className="text-red-100 text-sm">Crédit à valider</p>
                    <p className="text-2xl font-bold">
                      {totalCredit.toLocaleString()} F
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des ventes */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-amber-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-white/60">Chargement des ventes...</p>
            </div>
          </div>
        ) : sales.length === 0 ? (
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-gray-200 dark:border-white/10 text-center shadow-xl">
            <div className="p-6 bg-green-100 dark:bg-green-500/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Aucune vente en attente
            </h2>
            <p className="text-gray-600 dark:text-white/60">
              Toutes les ventes à crédit ont été traitées
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/20 overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {sale.saleNumber}
                          </h3>
                          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                            En attente
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-white/60 text-sm mt-1">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          {format(new Date(sale.createdAt), "PPP à HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {sale.total.toLocaleString()} <span className="text-lg text-gray-500 dark:text-white/60">F CFA</span>
                      </p>
                      <p className="text-orange-600 dark:text-orange-400 font-medium mt-1">
                        Crédit: {sale.remainingAmount.toLocaleString()} F
                      </p>
                    </div>
                  </div>

                  {sale.client && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-purple-500" />
                          <span className="text-gray-900 dark:text-white font-medium">{sale.client.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-5 w-5 text-green-500" />
                          <span className="text-gray-600 dark:text-white/80">{sale.client.phone}</span>
                        </div>
                        {sale.dueDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-red-500" />
                            <span className="text-gray-600 dark:text-white/80">
                              Échéance: {format(new Date(sale.dueDate), "PP", { locale: fr })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}
                    className="mt-4 flex items-center gap-2 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">Voir les articles ({sale.items.length})</span>
                    {expandedId === sale.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {expandedId === sale.id && (
                    <div className="mt-4 space-y-2">
                      {sale.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Package className="h-5 w-5 text-blue-500" />
                            <span className="text-gray-900 dark:text-white">{item.product.name}</span>
                            <span className="text-gray-500 dark:text-white/60">x{item.quantity}</span>
                          </div>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {item.total.toLocaleString()} F
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex items-center gap-3 flex-wrap">
                    <Button
                      onClick={() => handleApprove(sale.id)}
                      disabled={processingId === sale.id}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                    >
                      {processingId === sale.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ShieldCheck className="h-4 w-4 mr-2" />
                      )}
                      Approuver la vente
                    </Button>
                    <Button
                      onClick={() => handleReject(sale.id)}
                      disabled={processingId === sale.id}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-500/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-500/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
              <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Règle de validation
              </h3>
              <p className="text-gray-600 dark:text-white/60">
                Les ventes à crédit dépassant un certain montant nécessitent une validation 
                par un administrateur avant d'être finalisées. Cette mesure permet de 
                contrôler les risques liés aux crédits clients importants.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
