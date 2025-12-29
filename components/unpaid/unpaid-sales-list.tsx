"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { 
  AlertTriangle, 
  Clock, 
  DollarSign,
  Users,
  TrendingDown,
  Phone,
  Calendar,
  Banknote,
  AlertCircle,
  CheckCircle,
  XCircle,
  Sparkles,
  Filter,
  ArrowUpDown,
  Receipt,
  User,
  Bell
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { PaymentDialog } from "./payment-dialog"

interface UnpaidSale {
  id: string
  saleNumber: string
  client?: {
    id: string
    name: string
    phone: string
  }
  customerName?: string
  customerPhone?: string
  total: number
  amountPaid: number
  remainingAmount: number
  dueDate?: string
  createdAt: string
  daysOverdue: number
}

export function UnpaidSalesList() {
  const { toast } = useToast()
  const [unpaidSales, setUnpaidSales] = useState<UnpaidSale[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "30" | "60" | "90">("all")
  const [sortBy, setSortBy] = useState<"amount" | "days">("days")
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<UnpaidSale | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchUnpaidSales = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/sales/unpaid?filter=${filter}`)
      const data = await res.json()
      
      const sorted = [...data]
      if (sortBy === "amount") {
        sorted.sort((a, b) => b.remainingAmount - a.remainingAmount)
      } else {
        sorted.sort((a, b) => b.daysOverdue - a.daysOverdue)
      }
      
      setUnpaidSales(sorted)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les impayés",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnpaidSales()
  }, [filter, sortBy])

  const getOverdueInfo = (days: number) => {
    if (days > 90) return { 
      label: "Critique", 
      color: "text-red-500", 
      bgColor: "bg-red-500",
      bgLight: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-500",
      gradient: "from-red-500 to-rose-500",
      icon: XCircle
    }
    if (days > 60) return { 
      label: "Urgent", 
      color: "text-orange-500", 
      bgColor: "bg-orange-500",
      bgLight: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-500",
      gradient: "from-orange-500 to-amber-500",
      icon: AlertCircle
    }
    if (days > 30) return { 
      label: "Attention", 
      color: "text-yellow-500", 
      bgColor: "bg-yellow-500",
      bgLight: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-500",
      gradient: "from-yellow-500 to-amber-500",
      icon: AlertTriangle
    }
    return { 
      label: "Normal", 
      color: "text-green-500", 
      bgColor: "bg-green-500",
      bgLight: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-500",
      gradient: "from-green-500 to-emerald-500",
      icon: CheckCircle
    }
  }

  const stats = {
    total: unpaidSales.reduce((sum, s) => sum + s.remainingAmount, 0),
    count: unpaidSales.length,
    overdue30: unpaidSales.filter((s) => s.daysOverdue > 30).length,
    overdue60: unpaidSales.filter((s) => s.daysOverdue > 60).length,
    overdue90: unpaidSales.filter((s) => s.daysOverdue > 90).length,
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className={`grid grid-cols-2 lg:grid-cols-5 gap-4 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <DollarSign className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">{formatCurrency(stats.total)}</div>
          <div className="text-red-100 text-sm">Total impayé</div>
        </div>
        
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Receipt className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{stats.count}</div>
          <div className="text-purple-100 text-sm">Factures impayées</div>
        </div>
        
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Clock className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{stats.overdue30}</div>
          <div className="text-yellow-100 text-sm">+30 jours</div>
        </div>
        
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <AlertCircle className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{stats.overdue60}</div>
          <div className="text-orange-100 text-sm">+60 jours</div>
        </div>
        
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-600/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <XCircle className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{stats.overdue90}</div>
          <div className="text-red-100 text-sm">+90 jours (critique)</div>
        </div>
      </div>

      {/* Filtres et tri */}
      <div className={`flex flex-wrap items-center gap-4 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-1">
          {[
            { value: "all", label: "Tous", count: stats.count },
            { value: "30", label: "+30 jours", count: stats.overdue30, color: "text-yellow-500" },
            { value: "60", label: "+60 jours", count: stats.overdue60, color: "text-orange-500" },
            { value: "90", label: "+90 jours", count: stats.overdue90, color: "text-red-500" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                filter === f.value
                  ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg"
                  : `text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 ${f.color || ""}`
              }`}
            >
              {f.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                filter === f.value ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="w-4 h-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "amount" | "days")}
            className="h-10 px-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-sm"
            aria-label="Trier par"
          >
            <option value="days">Jours de retard</option>
            <option value="amount">Montant dû</option>
          </select>
        </div>
      </div>

      {/* Liste des impayés */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Chargement des impayés...</p>
          </div>
        </div>
      ) : (
        <div className={`space-y-4 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {unpaidSales.map((sale, index) => {
            const clientName = sale.client?.name || sale.customerName || "Client anonyme"
            const clientPhone = sale.client?.phone || sale.customerPhone || ""
            const overdueInfo = getOverdueInfo(sale.daysOverdue)
            const OverdueIcon = overdueInfo.icon
            const progressPercent = sale.total > 0 ? (sale.amountPaid / sale.total) * 100 : 0

            return (
              <div
                key={sale.id}
                className={`group relative bg-white dark:bg-gray-800 rounded-2xl border-2 ${overdueInfo.borderColor} shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {/* Indicateur de gravité */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${overdueInfo.gradient}`} />
                
                <div className="p-5 pl-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Info principale */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-xl ${overdueInfo.bgLight}`}>
                          <OverdueIcon className={`w-5 h-5 ${overdueInfo.color}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                            {sale.saleNumber}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${overdueInfo.bgLight} ${overdueInfo.color}`}>
                            <Clock className="w-3 h-3" />
                            {sale.daysOverdue > 0 ? `${sale.daysOverdue} jours de retard` : "À échéance"}
                          </span>
                        </div>
                      </div>

                      {/* Infos client */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{clientName}</span>
                        </div>
                        {clientPhone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-4 h-4" />
                            <span>{clientPhone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>Vente: {formatDate(sale.createdAt)}</span>
                        </div>
                        {sale.dueDate && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Bell className="w-4 h-4" />
                            <span>Échéance: {formatDate(sale.dueDate)}</span>
                          </div>
                        )}
                      </div>

                      {/* Montants */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div className="text-xs text-gray-500 mb-1">Total facture</div>
                          <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            {formatCurrency(sale.total)}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                          <div className="text-xs text-green-600 mb-1">Déjà payé</div>
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(sale.amountPaid)}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                          <div className="text-xs text-red-600 mb-1">Reste à payer</div>
                          <div className="text-lg font-bold text-red-600">
                            {formatCurrency(sale.remainingAmount)}
                          </div>
                        </div>
                      </div>

                      {/* Barre de progression */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progression du paiement</span>
                          <span className="font-bold">{progressPercent.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => {
                          setSelectedSale(sale)
                          setPaymentDialogOpen(true)
                        }}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30 transition-all duration-300 hover:shadow-xl hover:scale-105"
                      >
                        <Banknote className="w-4 h-4 mr-2" />
                        Paiement
                      </Button>
                      {clientPhone && (
                        <Button
                          variant="outline"
                          className="hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600"
                          onClick={() => window.open(`tel:${clientPhone}`)}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Appeler
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {unpaidSales.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Aucun impayé ! 🎉
          </h3>
          <p className="text-gray-500">Toutes les factures sont réglées</p>
        </div>
      )}

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        sale={selectedSale}
        onSuccess={fetchUnpaidSales}
      />
    </div>
  )
}
