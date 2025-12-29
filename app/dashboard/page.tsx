import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { MainLayout } from "@/components/layout/main-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { 
  getDashboardStats, 
  getStockValue, 
  getLowStockProducts, 
  getRecentSales,
  getCreditAnalytics 
} from "@/lib/db-queries"

async function getDashboardData() {
  // Utiliser les requêtes cachées et optimisées
  const [stats, stockData, lowStockProducts, recentSales, creditAnalytics] = await Promise.all([
    getDashboardStats(),
    getStockValue(),
    getLowStockProducts(5),
    getRecentSales(10),
    getCreditAnalytics(),
  ])

  return {
    todayRevenue: stats.todayRevenue,
    stockValue: stockData.stockValue,
    lowStockCount: stats.lowStockCount,
    lowStockProducts: lowStockProducts.map(p => ({
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      unitLabel: p.unitLabel,
    })),
    recentSales: recentSales.map(s => ({
      id: s.id,
      saleNumber: s.saleNumber,
      total: s.total,
      createdAt: s.createdAt instanceof Date 
        ? s.createdAt.toISOString() 
        : new Date(s.createdAt).toISOString(),
      user: { name: s.user?.name || "Utilisateur" },
    })),
    creditAnalytics: {
      dso: creditAnalytics.dso,
      badDebtRate: creditAnalytics.badDebtRate,
      totalUnpaid: creditAnalytics.totalUnpaid,
      totalClients: 0, // Sera calculé si nécessaire
      activeClientsWithDebt: 0,
    },
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const data = await getDashboardData()

  return (
    <MainLayout>
      <DashboardContent data={data} />
    </MainLayout>
  )
}
