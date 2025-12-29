import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Détails d'un bon de commande
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: params.id },
      include: {
        supplier: true,
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, unitLabel: true }
            }
          }
        }
      }
    })

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: "Bon de commande non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json(purchaseOrder)
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT - Mettre à jour un bon de commande
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== "ADMIN" && userRole !== "STOCK_MANAGER") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const { status, notes, deliveryDate } = body

    const existingOrder = await prisma.purchaseOrder.findUnique({
      where: { id: params.id },
      include: { items: true }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Bon de commande non trouvé" },
        { status: 404 }
      )
    }

    // Si le statut passe à RECEIVED, mettre à jour le stock
    if (status === "RECEIVED" && existingOrder.status !== "RECEIVED") {
      // Mettre à jour le stock pour chaque article
      for (const item of existingOrder.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            quantity: { increment: item.quantity }
          }
        })

        // Créer un mouvement de stock
        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            userId: session.user.id,
            type: "PURCHASE",
            quantity: item.quantity,
            reason: `Réception commande ${existingOrder.orderNumber}`,
            purchaseOrderId: existingOrder.id
          }
        })
      }
    }

    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id: params.id },
      data: {
        status,
        notes,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined
      },
      include: {
        supplier: true,
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true }
            }
          }
        }
      }
    })

    return NextResponse.json(purchaseOrder)
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE - Supprimer un bon de commande (seulement si PENDING)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const existingOrder = await prisma.purchaseOrder.findUnique({
      where: { id: params.id }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Bon de commande non trouvé" },
        { status: 404 }
      )
    }

    if (existingOrder.status !== "PENDING") {
      return NextResponse.json(
        { error: "Seuls les bons en attente peuvent être supprimés" },
        { status: 400 }
      )
    }

    // Supprimer les items d'abord
    await prisma.purchaseOrderItem.deleteMany({
      where: { purchaseOrderId: params.id }
    })

    await prisma.purchaseOrder.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Bon de commande supprimé" })
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}




