import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { MainLayout } from "@/components/layout/main-layout"
import { prisma } from "@/lib/prisma"
import ReportsContent from "@/components/reports/reports-content"

async function getReportsData() {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const startOfYear = new Date(today.getFullYear(), 0, 1)
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)

  const [monthlySales, lastMonthSales, saleItems, stockValue, categories, recentSales, totalClients, activeClients] = await Promise.all([
    // Ventes du mois
    prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    }),

    // Ventes du mois dernier
    prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: lastMonth,
          lte: endOfLastMonth,
        },
      },
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    }),

    // Top produits vendus
    prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      },
      include: {
        product: {
          select: {
            name: true,
            category: {
              select: { name: true }
            }
          },
        },
      },
    }),

    // Valeur du stock
    prisma.product.findMany({
      where: { active: true },
      select: {
        quantity: true,
        purchasePrice: true,
        sellingPrice: true,
        category: {
          select: { name: true }
        }
      },
    }),

    // Catégories
    prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    }),

    // Ventes récentes
    prisma.sale.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        client: { select: { name: true } },
        _count: { select: { items: true } }
      }
    }),

    // Clients
    prisma.client.count(),
    prisma.client.count({ where: { status: 'ACTIVE' } })
  ])

  // Calculer la valeur du stock
  const totalStockValue = stockValue.reduce(
    (sum, p) => sum + p.quantity * p.purchasePrice,
    0
  )

  const potentialValue = stockValue.reduce(
    (sum, p) => sum + p.quantity * p.sellingPrice,
    0
  )

  // Stock par catégorie
  const stockByCategory = stockValue.reduce((acc, p) => {
    const catName = p.category?.name || 'Sans catégorie'
    if (!acc[catName]) {
      acc[catName] = { value: 0, count: 0 }
    }
    acc[catName].value += p.quantity * p.purchasePrice
    acc[catName].count += p.quantity
    return acc
  }, {} as Record<string, { value: number; count: number }>)

  // Grouper et calculer les totaux par produit
  const productMap = new Map<string, { quantity: number; total: number; productName: string; category: string }>()
  
  saleItems.forEach((item) => {
    const productId = item.productId
    const existing = productMap.get(productId)
    if (existing) {
      existing.quantity += item.quantity
      existing.total += item.total
    } else {
      productMap.set(productId, {
        quantity: item.quantity,
        total: item.total,
        productName: item.product?.name || "Produit supprimé",
        category: item.product?.category?.name || "Sans catégorie"
      })
    }
  })

  const topProductsWithNames = Array.from(productMap.entries())
    .map(([productId, data]) => ({
      productId,
      _sum: {
        quantity: data.quantity,
        total: data.total,
      },
      productName: data.productName,
      category: data.category
    }))
    .sort((a, b) => b._sum.total - a._sum.total)
    .slice(0, 10)

  // Calcul de la croissance
  const lastMonthRevenue = lastMonthSales._sum.total || 0
  const currentMonthRevenue = monthlySales._sum.total || 0
  const growth = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0

  return {
    monthlyRevenue: currentMonthRevenue,
    monthlySalesCount: monthlySales._count.id || 0,
    lastMonthRevenue,
    growth,
    topProducts: topProductsWithNames,
    stockValue: totalStockValue,
    potentialValue,
    stockByCategory: Object.entries(stockByCategory).map(([name, data]) => ({
      name,
      value: data.value,
      count: data.count
    })),
    categories: categories.map(c => ({
      name: c.name,
      productCount: c._count.products
    })),
    recentSales: recentSales.map(s => ({
      id: s.id,
      saleNumber: s.saleNumber,
      total: s.total,
      paymentMethod: s.paymentMethod,
      createdAt: s.createdAt.toISOString(),
      userName: s.user?.name || 'Inconnu',
      clientName: s.client?.name || null,
      itemCount: s._count.items
    })),
    totalClients,
    activeClients
  }
}

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const userRole = (session.user as any).role
  if (userRole !== "ADMIN" && userRole !== "STOCK_MANAGER") {
    redirect("/dashboard")
  }

  const data = await getReportsData()

  return (
    <MainLayout>
      <ReportsContent data={data} />
    </MainLayout>
  )
}
