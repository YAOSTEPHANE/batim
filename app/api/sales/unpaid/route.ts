import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get("filter") || "all"
    const clientId = searchParams.get("clientId")

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const where: any = {
      isPaid: false,
      remainingAmount: {
        gt: 0,
      },
      requiresAdminApproval: false, // Exclure les ventes en attente d'approbation
    }

    if (clientId) {
      where.clientId = clientId
    }

    // Filtrer par nombre de jours de retard
    if (filter !== "all") {
      const days = parseInt(filter)
      const cutoffDate = new Date(today)
      cutoffDate.setDate(cutoffDate.getDate() - days)

      where.OR = [
        {
          dueDate: {
            lte: cutoffDate,
          },
        },
        {
          AND: [
            {
              dueDate: null,
            },
            {
              createdAt: {
                lte: cutoffDate,
              },
            },
          ],
        },
      ]
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Calculer les jours de retard pour chaque vente
    const salesWithOverdue = sales.map((sale) => {
      const dueDate = sale.dueDate ? new Date(sale.dueDate) : new Date(sale.createdAt)
      dueDate.setDate(dueDate.getDate() + 30) // Par défaut, 30 jours après la vente ou l'échéance

      const daysOverdue = Math.max(
        0,
        Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      )

      return {
        ...sale,
        daysOverdue,
      }
    })

    // Trier par jours de retard décroissant
    salesWithOverdue.sort((a, b) => b.daysOverdue - a.daysOverdue)

    return NextResponse.json(salesWithOverdue)
  } catch (error) {
    console.error("Error fetching unpaid sales:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

