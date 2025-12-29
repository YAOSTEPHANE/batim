"use client"

import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  ShoppingCart,
  Users,
  Percent,
  Award,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PieChart,
  Activity,
  Target,
  Layers,
  Clock
} from "lucide-react"

interface ReportsData {
  monthlyRevenue: number
  monthlySalesCount: number
  lastMonthRevenue: number
  growth: number
  topProducts: {
    productId: string
    _sum: { quantity: number; total: number }
    productName: string
    category: string
  }[]
  stockValue: number
  potentialValue: number
  stockByCategory: { name: string; value: number; count: number }[]
  categories: { name: string; productCount: number }[]
  recentSales: {
    id: string
    saleNumber: string
    total: number
    paymentMethod: string
    createdAt: string
    userName: string
    clientName: string | null
    itemCount: number
  }[]
  totalClients: number
  activeClients: number
}

const paymentMethodColors: Record<string, { bg: string; text: string; label: string }> = {
  CASH: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600", label: "Espèces" },
  CARD: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600", label: "Carte" },
  MOBILE_MONEY: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600", label: "Mobile" },
  CREDIT: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600", label: "Crédit" },
}

export default function ReportsContent({ data }: { data: ReportsData }) {
  const [mounted, setMounted] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<"month" | "year">("month")

  useEffect(() => {
    setMounted(true)
  }, [])

  const margin = data.potentialValue - data.stockValue
  const marginPercent = data.stockValue > 0 ? (margin / data.stockValue) * 100 : 0
  const avgTicket = data.monthlySalesCount > 0 ? data.monthlyRevenue / data.monthlySalesCount : 0

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
      {/* Effets de fond */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-rose-400/20 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-400/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-400/10 rounded-full filter blur-3xl" />
      </div>

      <div className="relative p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/30">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-rose-800 to-pink-800 dark:from-white dark:via-rose-200 dark:to-pink-200 bg-clip-text text-transparent">
                Rapports & Analyses
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Statistiques de votre quincaillerie
              </p>
            </div>
          </div>

          {/* Période */}
          <div className="flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-1">
            {[
              { value: "month", label: "Ce mois" },
              { value: "year", label: "Cette année" },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedPeriod === period.value
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs principaux */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {/* CA du mois */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <DollarSign className="w-10 h-10 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{formatCurrency(data.monthlyRevenue)}</div>
            <div className="text-emerald-100 text-sm mb-2">Chiffre d'affaires</div>
            <div className={`flex items-center gap-1 text-sm ${data.growth >= 0 ? "text-emerald-200" : "text-red-200"}`}>
              {data.growth >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span className="font-bold">{Math.abs(data.growth).toFixed(1)}%</span>
              <span className="opacity-80">vs mois dernier</span>
            </div>
          </div>

          {/* Ventes */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <ShoppingCart className="w-10 h-10 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{data.monthlySalesCount}</div>
            <div className="text-blue-100 text-sm mb-2">Ventes ce mois</div>
            <div className="text-sm text-blue-200">
              Ticket moyen: <span className="font-bold">{formatCurrency(avgTicket)}</span>
            </div>
          </div>

          {/* Valeur du stock */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-xl shadow-purple-500/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <Package className="w-10 h-10 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{formatCurrency(data.stockValue)}</div>
            <div className="text-purple-100 text-sm mb-2">Valeur du stock</div>
            <div className="text-sm text-purple-200">
              Potentiel: <span className="font-bold">{formatCurrency(data.potentialValue)}</span>
            </div>
          </div>

          {/* Marge */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <Percent className="w-10 h-10 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{formatCurrency(margin)}</div>
            <div className="text-amber-100 text-sm mb-2">Marge potentielle</div>
            <div className="text-sm text-amber-200">
              <span className="font-bold">{marginPercent.toFixed(1)}%</span> de marge
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Produits */}
          <div className={`lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-rose-500/10 to-pink-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 dark:text-gray-200">Top 10 Produits</h2>
                    <p className="text-sm text-gray-500">Meilleures ventes du mois</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-medium">
                  {data.topProducts.length} produits
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              {data.topProducts.map((item, index) => {
                const maxTotal = data.topProducts[0]?._sum.total || 1
                const percentage = (item._sum.total / maxTotal) * 100
                
                return (
                  <div
                    key={item.productId}
                    className="group relative p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 dark:hover:from-rose-900/20 dark:hover:to-pink-900/20 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      {/* Rang */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${
                        index === 0 ? "bg-gradient-to-br from-yellow-400 to-amber-500" :
                        index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400" :
                        index === 2 ? "bg-gradient-to-br from-orange-400 to-amber-600" :
                        "bg-gradient-to-br from-gray-400 to-gray-500"
                      }`}>
                        {index + 1}
                      </div>
                      
                      {/* Info produit */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-rose-600 transition-colors">
                          {item.productName}
                        </div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </div>
                      
                      {/* Stats */}
                      <div className="text-right">
                        <div className="font-bold text-lg text-rose-600 dark:text-rose-400">
                          {formatCurrency(item._sum.total)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item._sum.quantity} unités
                        </div>
                      </div>
                    </div>
                    
                    {/* Barre de progression */}
                    <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              
              {data.topProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune vente ce mois</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar droite */}
          <div className="space-y-6">
            {/* Stock par catégorie */}
            <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}>
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-500/10 to-violet-500/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 text-white">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 dark:text-gray-200">Stock par Catégorie</h2>
                    <p className="text-sm text-gray-500">Répartition de la valeur</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                {data.stockByCategory.slice(0, 6).map((cat, index) => {
                  const colors = [
                    "from-purple-500 to-violet-500",
                    "from-blue-500 to-cyan-500",
                    "from-emerald-500 to-teal-500",
                    "from-orange-500 to-amber-500",
                    "from-rose-500 to-pink-500",
                    "from-indigo-500 to-purple-500"
                  ]
                  const percentage = data.stockValue > 0 ? (cat.value / data.stockValue) * 100 : 0
                  
                  return (
                    <div key={cat.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                        <span className="text-gray-500">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{formatCurrency(cat.value)}</span>
                        <span>{cat.count} articles</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Clients */}
            <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden transition-all duration-700 delay-400 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}>
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 dark:text-gray-200">Clients</h2>
                    <p className="text-sm text-gray-500">Vue d'ensemble</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">Total clients</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">{data.totalClients}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600">
                      <Activity className="w-5 h-5" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">Clients actifs</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{data.activeClients}</span>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Taux d'activité</span>
                    <span className="font-bold text-green-600">
                      {data.totalClients > 0 ? ((data.activeClients / data.totalClients) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      style={{ width: `${data.totalClients > 0 ? (data.activeClients / data.totalClients) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ventes récentes */}
        <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 dark:text-gray-200">Ventes Récentes</h2>
                  <p className="text-sm text-gray-500">Dernières transactions</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">N° Vente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Vendeur</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Articles</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Paiement</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.recentSales.map((sale) => {
                  const paymentInfo = paymentMethodColors[sale.paymentMethod] || paymentMethodColors.CASH
                  return (
                    <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-medium text-blue-600 dark:text-blue-400">
                          {sale.saleNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(sale.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                        {sale.clientName || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {sale.userName}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-medium">
                          {sale.itemCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${paymentInfo.bg} ${paymentInfo.text}`}>
                          {paymentInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-800 dark:text-gray-200">
                        {formatCurrency(sale.total)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}




