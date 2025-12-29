"use client"

import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  CreditCard, 
  Clock,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Target
} from "lucide-react"

interface DashboardData {
  todayRevenue: number
  stockValue: number
  lowStockCount: number
  lowStockProducts: Array<{
    id: string
    name: string
    quantity: number
    unitLabel: string
  }>
  recentSales: Array<{
    id: string
    saleNumber: string
    total: number
    createdAt: string
    user: { name: string }
  }>
  creditAnalytics: {
    dso: number
    badDebtRate: number
    totalUnpaid: number
    totalClients: number
    activeClientsWithDebt: number
  }
}

interface DashboardContentProps {
  data: DashboardData
}

function StatCard3D({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient, 
  delay = 0,
  trend,
  trendValue 
}: { 
  title: string
  value: string | number
  subtitle?: string
  icon: any
  gradient: string
  delay?: number
  trend?: "up" | "down"
  trendValue?: string
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div 
      className={`
        relative group cursor-pointer
        transform transition-all duration-500 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Effet de lueur derrière la carte */}
      <div className={`
        absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-70 
        transition-opacity duration-500 blur-xl ${gradient}
      `} />
      
      {/* Carte principale */}
      <div className={`
        relative overflow-hidden rounded-2xl p-6
        bg-gradient-to-br ${gradient}
        transform-gpu transition-all duration-300
        group-hover:scale-[1.02] group-hover:-translate-y-1
        shadow-lg group-hover:shadow-2xl
        border border-white/20
      `}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      >
        {/* Effet de brillance */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 
          opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Particules décoratives */}
        <div className="absolute top-2 right-2 opacity-20">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm
              transform transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
              <Icon className="w-6 h-6 text-white" />
            </div>
            {trend && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                ${trend === 'up' ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'}`}>
                {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {trendValue}
              </div>
            )}
          </div>
          
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-white/60 text-xs mt-2">{subtitle}</p>
          )}
        </div>

        {/* Effet 3D - ombre interne */}
        <div className="absolute inset-0 rounded-2xl shadow-inner pointer-events-none" />
      </div>
    </div>
  )
}

function GlassCard({ 
  title, 
  children, 
  icon: Icon,
  delay = 0 
}: { 
  title: string
  children: React.ReactNode
  icon?: any
  delay?: number
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl
        border border-gray-200/50 dark:border-gray-700/50
        shadow-xl
        transform transition-all duration-500 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-gray-800/50 pointer-events-none" />
      
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-4">
          {Icon && (
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  )
}

function AlertItem({ product, index }: { product: any; index: number }) {
  return (
    <div 
      className="flex items-center justify-between p-3 rounded-xl 
        bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20
        border border-red-200/50 dark:border-red-800/50
        transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="font-medium text-gray-800 dark:text-white">{product.name}</span>
      </div>
      <span className="text-sm px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium">
        {product.quantity} {product.unitLabel}
      </span>
    </div>
  )
}

function SaleItem({ sale, index }: { sale: any; index: number }) {
  return (
    <div 
      className="flex items-center justify-between p-4 rounded-xl
        bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50
        border border-gray-100 dark:border-gray-700/50
        transform transition-all duration-300 hover:scale-[1.01] hover:shadow-lg
        hover:border-indigo-200 dark:hover:border-indigo-800"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 
          flex items-center justify-center text-white font-bold text-sm">
          {sale.saleNumber.slice(-2)}
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-white">{sale.saleNumber}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {sale.user.name} • {new Date(sale.createdAt).toLocaleTimeString("fr-FR", { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg text-gray-800 dark:text-white">
          {formatCurrency(sale.total)}
        </p>
      </div>
    </div>
  )
}

export function DashboardContent({ data }: DashboardContentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 
      dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
      
      {/* Effets de fond */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full 
          mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full 
          mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-400 rounded-full 
          mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative p-6 lg:p-8 space-y-8">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 
                dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">
                Tableau de bord
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 ml-14">
              Vue d'ensemble de votre quincaillerie • {new Date().toLocaleDateString("fr-FR", { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Cartes principales - KPIs */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard3D
            title="CA Aujourd'hui"
            value={formatCurrency(data.todayRevenue)}
            icon={TrendingUp}
            gradient="from-emerald-500 to-teal-600"
            delay={100}
            trend="up"
            trendValue="+12%"
          />
          <StatCard3D
            title="Valeur du Stock"
            value={formatCurrency(data.stockValue)}
            icon={Package}
            gradient="from-blue-500 to-indigo-600"
            delay={200}
          />
          <StatCard3D
            title="Produits en Rupture"
            value={data.lowStockCount}
            subtitle="Nécessitent un réapprovisionnement"
            icon={AlertTriangle}
            gradient="from-orange-500 to-red-600"
            delay={300}
          />
          <StatCard3D
            title="Ventes du Jour"
            value={data.recentSales.length}
            subtitle="Transactions effectuées"
            icon={ShoppingCart}
            gradient="from-violet-500 to-purple-600"
            delay={400}
          />
        </div>

        {/* KPIs Crédit */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard3D
            title="Total Impayé"
            value={formatCurrency(data.creditAnalytics.totalUnpaid || 0)}
            subtitle="Créances en cours"
            icon={CreditCard}
            gradient="from-amber-500 to-orange-600"
            delay={500}
          />
          <StatCard3D
            title="DSO"
            value={`${data.creditAnalytics.dso || 0} jours`}
            subtitle="Délai moyen de recouvrement"
            icon={Clock}
            gradient="from-cyan-500 to-blue-600"
            delay={600}
          />
          <StatCard3D
            title="Taux d'impayés"
            value={`${data.creditAnalytics.badDebtRate || 0}%`}
            subtitle={data.creditAnalytics.badDebtRate > 2 ? "⚠️ Au-dessus de 2%" : "✓ Objectif atteint"}
            icon={Target}
            gradient={data.creditAnalytics.badDebtRate > 2 
              ? "from-red-500 to-rose-600" 
              : "from-green-500 to-emerald-600"}
            delay={700}
          />
          <StatCard3D
            title="Clients avec Dette"
            value={data.creditAnalytics.activeClientsWithDebt || 0}
            subtitle={`sur ${data.creditAnalytics.totalClients || 0} clients`}
            icon={Users}
            gradient="from-fuchsia-500 to-pink-600"
            delay={800}
          />
        </div>

        {/* Grille inférieure */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Alertes de stock */}
          {data.lowStockProducts.length > 0 && (
            <GlassCard title="Alertes de Stock" icon={AlertTriangle} delay={900}>
              <div className="space-y-3">
                {data.lowStockProducts.map((product, index) => (
                  <AlertItem key={product.id} product={product} index={index} />
                ))}
              </div>
            </GlassCard>
          )}

          {/* Ventes récentes */}
          <GlassCard 
            title="Ventes Récentes" 
            icon={ShoppingCart} 
            delay={data.lowStockProducts.length > 0 ? 1000 : 900}
          >
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {data.recentSales.length > 0 ? (
                data.recentSales.map((sale, index) => (
                  <SaleItem key={sale.id} sale={sale} index={index} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Aucune vente aujourd'hui</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}




