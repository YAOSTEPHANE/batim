import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Calcule le DSO (Days Sales Outstanding) - Délai moyen de recouvrement
 */
async function calculateDSO() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Récupérer toutes les ventes à crédit payées avec leurs dates de paiement
  const paidCreditSales = await prisma.sale.findMany({
    where: {
      paymentMethod: "CREDIT",
      isPaid: true,
    },
    include: {
      payments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1, // Dernier paiement
      },
    },
  })

  if (paidCreditSales.length === 0) {
    return 0
  }

  let totalDays = 0
  for (const sale of paidCreditSales) {
    const saleDate = new Date(sale.createdAt)
    const lastPaymentDate = sale.payments[0]
      ? new Date(sale.payments[0].createdAt)
      : saleDate

    const days = Math.floor(
      (lastPaymentDate.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    totalDays += days
  }

  return Math.round(totalDays / paidCreditSales.length)
}

/**
 * Calcule le taux d'impayés (créances irrécouvrables)
 */
async function calculateBadDebtRate() {
  const today = new Date()
  const oneYearAgo = new Date(today)
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  // CA total sur l'année
  const totalRevenue = await prisma.sale.aggregate({
    where: {
      createdAt: {
        gte: oneYearAgo,
      },
    },
    _sum: {
      total: true,
    },
  })

  // Créances impayées depuis plus de 180 jours (considérées comme irrécouvrables)
  const sixMonthsAgo = new Date(today)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const badDebts = await prisma.sale.aggregate({
    where: {
      paymentMethod: "CREDIT",
      isPaid: false,
      remainingAmount: { gt: 0 },
      OR: [
        {
          dueDate: {
            lte: sixMonthsAgo,
          },
        },
        {
          AND: [
            { dueDate: null },
            {
              createdAt: {
                lte: sixMonthsAgo,
              },
            },
          ],
        },
      ],
    },
    _sum: {
      remainingAmount: true,
    },
  })

  const totalRevenueAmount = totalRevenue._sum.total || 1
  const badDebtAmount = badDebts._sum.remainingAmount || 0

  return (badDebtAmount / totalRevenueAmount) * 100
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "ADMIN" && userRole !== "STOCK_MANAGER") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const [dso, badDebtRate, totalUnpaid, totalClients, activeClients] =
      await Promise.all([
        calculateDSO(),
        calculateBadDebtRate(),
        prisma.sale.aggregate({
          where: {
            paymentMethod: "CREDIT",
            isPaid: false,
            remainingAmount: { gt: 0 },
          },
          _sum: {
            remainingAmount: true,
          },
        }),
        prisma.client.count(),
        prisma.client.count({
          where: {
            status: "ACTIVE",
            soldeActuel: { gt: 0 },
          },
        }),
      ])

    return NextResponse.json({
      dso,
      badDebtRate: parseFloat(badDebtRate.toFixed(2)),
      totalUnpaid: totalUnpaid._sum.remainingAmount || 0,
      totalClients,
      activeClientsWithDebt: activeClients,
    })
  } catch (error) {
    console.error("Error calculating credit analytics:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}




