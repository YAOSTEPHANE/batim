import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Seul un administrateur peut approuver" },
        { status: 403 }
      )
    }

    const userId = (session.user as any).id

    // Récupérer la vente
    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        client: true,
      },
    })

    if (!sale) {
      return NextResponse.json({ error: "Vente non trouvée" }, { status: 404 })
    }

    if (!sale.requiresAdminApproval) {
      return NextResponse.json(
        { error: "Cette vente ne nécessite pas d'approbation" },
        { status: 400 }
      )
    }

    if (sale.approvedBy) {
      return NextResponse.json(
        { error: "Cette vente a déjà été approuvée" },
        { status: 400 }
      )
    }

    // Approuver et finaliser la vente
    const result = await prisma.$transaction(async (tx) => {
      // Mettre à jour le stock
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        })

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            userId: sale.userId,
            type: "SALE",
            quantity: -item.quantity,
            reason: "Vente approuvée",
            saleId: sale.id,
          },
        })
      }

      // Mettre à jour le solde du client
      if (sale.clientId && sale.remainingAmount > 0) {
        await tx.client.update({
          where: { id: sale.clientId },
          data: {
            soldeActuel: {
              increment: sale.remainingAmount,
            },
          },
        })
      }

      // Marquer comme approuvée
      const updatedSale = await tx.sale.update({
        where: { id: params.id },
        data: {
          approvedBy: userId,
          approvedAt: new Date(),
          requiresAdminApproval: false,
        },
      })

      return updatedSale
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error approving sale:", error)
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    )
  }
}




