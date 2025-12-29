import { prisma } from "@/lib/prisma"
import { createCachedFunction, CACHE_TAGS, CACHE_DURATIONS, requestCache } from "@/lib/cache"

/**
 * Requêtes optimisées avec caching pour la base de données
 * Utilise des sélections minimales et le caching intelligent
 */

// ==================== DASHBOARD ====================

export const getDashboardStats = createCachedFunction(
  async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [todaySales, stockStats, lowStockCount, creditStats] = await Promise.all([
      // Ventes du jour - agrégation simple
      prisma.sale.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { total: true },
        _count: { id: true },
      }),

      // Stats stock - agrégation optimisée
      prisma.product.aggregate({
        where: { active: true },
        _sum: { quantity: true },
        _count: { id: true },
      }),

      // Produits en rupture - count seulement
      prisma.$runCommandRaw({
        aggregate: "products",
        pipeline: [
          { $match: { active: true } },
          { $match: { $expr: { $lte: ["$quantity", "$minThreshold"] } } },
          { $count: "count" },
        ],
        cursor: {},
      }),

      // Stats crédit
      prisma.sale.aggregate({
        where: {
          paymentMethod: "CREDIT",
          isPaid: false,
          remainingAmount: { gt: 0 },
        },
        _sum: { remainingAmount: true },
        _count: { id: true },
      }),
    ])

    // Extraire le count des produits en rupture
    const lowStockResult = lowStockCount as any
    const lowStock = lowStockResult?.cursor?.firstBatch?.[0]?.count || 0

    return {
      todayRevenue: todaySales._sum.total || 0,
      todaySalesCount: todaySales._count.id || 0,
      totalProducts: stockStats._count.id || 0,
      lowStockCount: lowStock,
      totalUnpaid: creditStats._sum.remainingAmount || 0,
      unpaidCount: creditStats._count.id || 0,
    }
  },
  {
    tags: [CACHE_TAGS.DASHBOARD, CACHE_TAGS.SALES, CACHE_TAGS.PRODUCTS],
    revalidate: CACHE_DURATIONS.SHORT,
    keyParts: ["dashboard-stats"],
  }
)

export const getStockValue = createCachedFunction(
  async () => {
    const result = await prisma.product.aggregate({
      where: { active: true },
      _sum: {
        quantity: true,
      },
    })

    // Calculer la valeur avec une requête raw MongoDB pour performance
    const valueResult = await prisma.$runCommandRaw({
      aggregate: "products",
      pipeline: [
        { $match: { active: true } },
        {
          $group: {
            _id: null,
            totalValue: {
              $sum: { $multiply: ["$quantity", "$purchasePrice"] },
            },
            potentialValue: {
              $sum: { $multiply: ["$quantity", "$sellingPrice"] },
            },
          },
        },
      ],
      cursor: {},
    }) as any

    const values = valueResult?.cursor?.firstBatch?.[0] || {
      totalValue: 0,
      potentialValue: 0,
    }

    return {
      stockValue: values.totalValue || 0,
      potentialValue: values.potentialValue || 0,
      totalQuantity: result._sum.quantity || 0,
    }
  },
  {
    tags: [CACHE_TAGS.PRODUCTS],
    revalidate: CACHE_DURATIONS.MEDIUM,
    keyParts: ["stock-value"],
  }
)

export const getLowStockProducts = createCachedFunction(
  async (limit: number = 5) => {
    return prisma.product.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        minThreshold: true,
        unitLabel: true,
        category: {
          select: { name: true },
        },
      },
      orderBy: [
        { quantity: "asc" },
      ],
      take: limit * 2, // Prendre plus pour filtrer ensuite
    }).then(products => 
      products
        .filter(p => p.quantity <= p.minThreshold)
        .slice(0, limit)
    )
  },
  {
    tags: [CACHE_TAGS.PRODUCTS],
    revalidate: CACHE_DURATIONS.MEDIUM,
    keyParts: ["low-stock-products"],
  }
)

export const getRecentSales = createCachedFunction(
  async (limit: number = 10) => {
    return prisma.sale.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        saleNumber: true,
        total: true,
        paymentMethod: true,
        isPaid: true,
        createdAt: true,
        user: {
          select: { name: true },
        },
        client: {
          select: { name: true },
        },
        _count: {
          select: { items: true },
        },
      },
    })
  },
  {
    tags: [CACHE_TAGS.SALES],
    revalidate: CACHE_DURATIONS.SHORT,
    keyParts: ["recent-sales"],
  }
)

// ==================== PRODUCTS ====================

export const getProductsCount = createCachedFunction(
  async (filters?: { categoryId?: string; active?: boolean }) => {
    return prisma.product.count({
      where: {
        ...(filters?.categoryId && { categoryId: filters.categoryId }),
        ...(filters?.active !== undefined && { active: filters.active }),
      },
    })
  },
  {
    tags: [CACHE_TAGS.PRODUCTS],
    revalidate: CACHE_DURATIONS.MEDIUM,
    keyParts: ["products-count"],
  }
)

export const getProductsPaginated = requestCache(
  async (page: number = 1, limit: number = 20, search?: string) => {
    const skip = (page - 1) * limit

    const where: any = { active: true }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { barcode: { contains: search, mode: "insensitive" } },
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          sku: true,
          barcode: true,
          sellingPrice: true,
          purchasePrice: true,
          quantity: true,
          minThreshold: true,
          unitLabel: true,
          imageUrl: true,
          category: {
            select: { id: true, name: true },
          },
          brand: {
            select: { id: true, name: true },
          },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    }
  }
)

// ==================== CLIENTS ====================

export const getClientsStats = createCachedFunction(
  async () => {
    const [total, active, blocked, litigation, totalCredit, totalDebt] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { status: "ACTIVE" } }),
      prisma.client.count({ where: { status: "BLOCKED" } }),
      prisma.client.count({ where: { status: "LITIGATION" } }),
      prisma.client.aggregate({
        _sum: { limiteCredit: true },
      }),
      prisma.client.aggregate({
        _sum: { soldeActuel: true },
      }),
    ])

    return {
      total,
      active,
      blocked,
      litigation,
      totalCredit: totalCredit._sum.limiteCredit || 0,
      totalDebt: totalDebt._sum.soldeActuel || 0,
    }
  },
  {
    tags: [CACHE_TAGS.CLIENTS],
    revalidate: CACHE_DURATIONS.MEDIUM,
    keyParts: ["clients-stats"],
  }
)

// ==================== REPORTS ====================

export const getMonthlyStats = createCachedFunction(
  async (year: number, month: number) => {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59)

    const [sales, purchases] = await Promise.all([
      prisma.sale.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { total: true, discountAmount: true },
        _count: { id: true },
        _avg: { total: true },
      }),
      prisma.purchaseOrder.aggregate({
        where: {
          orderDate: { gte: startDate, lte: endDate },
          status: "RECEIVED",
        },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
    ])

    return {
      revenue: sales._sum.total || 0,
      salesCount: sales._count.id || 0,
      avgTicket: sales._avg.total || 0,
      discounts: sales._sum.discountAmount || 0,
      purchases: purchases._sum.totalAmount || 0,
      purchasesCount: purchases._count.id || 0,
    }
  },
  {
    tags: [CACHE_TAGS.REPORTS, CACHE_TAGS.SALES],
    revalidate: CACHE_DURATIONS.MEDIUM,
    keyParts: ["monthly-stats"],
  }
)

export const getTopProducts = createCachedFunction(
  async (startDate: Date, endDate: Date, limit: number = 10) => {
    // Utiliser aggregation MongoDB pour performance
    const result = await prisma.$runCommandRaw({
      aggregate: "saleItems",
      pipeline: [
        {
          $lookup: {
            from: "sales",
            localField: "saleId",
            foreignField: "_id",
            as: "sale",
          },
        },
        { $unwind: "$sale" },
        {
          $match: {
            "sale.createdAt": {
              $gte: { $date: startDate.toISOString() },
              $lte: { $date: endDate.toISOString() },
            },
          },
        },
        {
          $group: {
            _id: "$productId",
            totalQuantity: { $sum: "$quantity" },
            totalRevenue: { $sum: "$total" },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: {
            productId: "$_id",
            productName: "$product.name",
            sku: "$product.sku",
            totalQuantity: 1,
            totalRevenue: 1,
          },
        },
      ],
      cursor: {},
    }) as any

    return result?.cursor?.firstBatch || []
  },
  {
    tags: [CACHE_TAGS.REPORTS, CACHE_TAGS.SALES, CACHE_TAGS.PRODUCTS],
    revalidate: CACHE_DURATIONS.MEDIUM,
    keyParts: ["top-products"],
  }
)

// ==================== CREDIT ANALYTICS ====================

export const getCreditAnalytics = createCachedFunction(
  async () => {
    const today = new Date()
    const oneYearAgo = new Date(today)
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const sixMonthsAgo = new Date(today)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const [totalUnpaid, badDebts, totalRevenue, dsoData] = await Promise.all([
      // Total impayé
      prisma.sale.aggregate({
        where: {
          paymentMethod: "CREDIT",
          isPaid: false,
          remainingAmount: { gt: 0 },
        },
        _sum: { remainingAmount: true },
        _count: { id: true },
      }),

      // Créances douteuses (> 6 mois)
      prisma.sale.aggregate({
        where: {
          paymentMethod: "CREDIT",
          isPaid: false,
          remainingAmount: { gt: 0 },
          OR: [
            { dueDate: { lte: sixMonthsAgo } },
            {
              AND: [
                { dueDate: null },
                { createdAt: { lte: sixMonthsAgo } },
              ],
            },
          ],
        },
        _sum: { remainingAmount: true },
      }),

      // CA total sur 1 an
      prisma.sale.aggregate({
        where: { createdAt: { gte: oneYearAgo } },
        _sum: { total: true },
      }),

      // DSO - ventes crédit payées
      prisma.sale.findMany({
        where: {
          paymentMethod: "CREDIT",
          isPaid: true,
          createdAt: { gte: oneYearAgo },
        },
        select: {
          createdAt: true,
          payments: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { createdAt: true },
          },
        },
        take: 100, // Limiter pour performance
      }),
    ])

    // Calcul DSO
    let dso = 0
    if (dsoData.length > 0) {
      let totalDays = 0
      for (const sale of dsoData) {
        const saleDate = new Date(sale.createdAt)
        const lastPaymentDate = sale.payments[0]
          ? new Date(sale.payments[0].createdAt)
          : saleDate
        totalDays += Math.floor(
          (lastPaymentDate.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      }
      dso = Math.round(totalDays / dsoData.length)
    }

    const badDebtRate =
      ((badDebts._sum.remainingAmount || 0) / (totalRevenue._sum.total || 1)) * 100

    return {
      dso,
      badDebtRate: parseFloat(badDebtRate.toFixed(2)),
      totalUnpaid: totalUnpaid._sum.remainingAmount || 0,
      unpaidCount: totalUnpaid._count.id || 0,
    }
  },
  {
    tags: [CACHE_TAGS.SALES, CACHE_TAGS.CLIENTS],
    revalidate: CACHE_DURATIONS.MEDIUM,
    keyParts: ["credit-analytics"],
  }
)




