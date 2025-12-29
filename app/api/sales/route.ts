import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requiresAdminApproval, shouldAutoBlockClient } from "@/lib/business-rules"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const {
      items,
      subtotal,
      discountAmount,
      discountPercent,
      total,
      paymentMethod,
      amountPaid,
      change,
      clientId,
      customerName,
      customerPhone,
      dueDate,
    } = body

    // Générer un numéro de vente unique
    const today = new Date()
    const dateStr = today.toISOString().split("T")[0].replace(/-/g, "")
    const count = await prisma.sale.count({
      where: {
        createdAt: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
        },
      },
    })
    const saleNumber = `VTE-${dateStr}-${String(count + 1).padStart(4, "0")}`

    // Vérifier le stock et créer la vente dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Vérifier le client et sa limite de crédit si crédit
      if (paymentMethod === "CREDIT" && clientId) {
        const client = await tx.client.findUnique({
          where: { id: clientId },
        })

        if (!client) {
          throw new Error("Client non trouvé")
        }

        if (client.status === "BLOCKED" || client.status === "LITIGATION") {
          throw new Error(
            `Le compte de ce client est ${client.status === "BLOCKED" ? "bloqué" : "en contentieux"}`
          )
        }

        // Vérifier le blocage automatique
        const { shouldBlock, oldestUnpaidDays } = await shouldAutoBlockClient(
          clientId,
          tx
        )

        if (shouldBlock) {
          // Bloquer automatiquement le client
          await tx.client.update({
            where: { id: clientId },
            data: {
              status: "BLOCKED",
              notes: `Blocage automatique: facture impayée depuis ${oldestUnpaidDays} jours`,
            },
          })
          throw new Error(
            `Le client a été bloqué automatiquement: facture impayée depuis ${oldestUnpaidDays} jours`
          )
        }

        const totalAmount = parseFloat(total)
        const paidAmount = parseFloat(amountPaid) || 0
        const remaining = totalAmount - paidAmount

        if (client.limiteCredit > 0 && client.soldeActuel + remaining > client.limiteCredit) {
          throw new Error(
            `Limite de crédit dépassée. Solde actuel: ${client.soldeActuel}, Limite: ${client.limiteCredit}`
          )
        }

        // Vérifier si validation admin requise
        const needsApproval = requiresAdminApproval(remaining)
        const userRole = (session.user as any).role

        if (needsApproval && userRole !== "ADMIN") {
          // Créer la vente en attente d'approbation
          const sale = await tx.sale.create({
            data: {
              saleNumber,
              userId,
              clientId,
              subtotal: parseFloat(subtotal),
              discountAmount: parseFloat(discountAmount) || 0,
              discountPercent: discountPercent ? parseFloat(discountPercent) : null,
              total: totalAmount,
              paymentMethod,
              amountPaid: paidAmount,
              remainingAmount: remaining,
              change: 0,
              isPaid: false,
              dueDate: dueDate ? new Date(dueDate) : null,
              requiresAdminApproval: true,
              items: {
                create: items.map((item: any) => ({
                  productId: item.productId,
                  quantity: parseFloat(item.quantity),
                  unitPrice: parseFloat(item.unitPrice),
                  discount: parseFloat(item.discount) || 0,
                  total: parseFloat(item.total),
                })),
              },
            },
          })

          // Ne pas mettre à jour le stock ni le solde du client tant que non approuvé
          return { sale, requiresApproval: true }
        }
      }

      // Vérifier le stock pour tous les articles
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        })

        if (!product) {
          throw new Error(`Produit ${item.productId} introuvable`)
        }

        if (product.quantity < item.quantity) {
          throw new Error(
            `Stock insuffisant pour ${product.name}. Disponible: ${product.quantity}, Demandé: ${item.quantity}`
          )
        }
      }

      // Calculer les montants
      const totalAmount = parseFloat(total)
      const paidAmount = parseFloat(amountPaid) || 0
      const remainingAmount = paymentMethod === "CREDIT" ? totalAmount - paidAmount : 0
      const isPaid = remainingAmount <= 0

      // Vérifier si validation admin requise (pour les ventes normales aussi)
      const needsApproval = paymentMethod === "CREDIT" && requiresAdminApproval(remainingAmount)
      const userRole = (session.user as any).role
      const isApproved = !needsApproval || userRole === "ADMIN"

      // Créer la vente
      const sale = await tx.sale.create({
        data: {
          saleNumber,
          userId,
          clientId: clientId || null,
          subtotal: parseFloat(subtotal),
          discountAmount: parseFloat(discountAmount) || 0,
          discountPercent: discountPercent ? parseFloat(discountPercent) : null,
          total: totalAmount,
          paymentMethod,
          amountPaid: paidAmount,
          remainingAmount,
          change: parseFloat(change) || 0,
          isPaid,
          dueDate: dueDate ? new Date(dueDate) : null,
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          requiresAdminApproval: needsApproval && !isApproved,
          approvedBy: isApproved && needsApproval ? userId : null,
          approvedAt: isApproved && needsApproval ? new Date() : null,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: parseFloat(item.quantity),
              unitPrice: parseFloat(item.unitPrice),
              discount: parseFloat(item.discount) || 0,
              total: parseFloat(item.total),
            })),
          },
        },
      })

      // Mettre à jour le stock et le solde du client seulement si approuvé
      if (isApproved) {
        // Mettre à jour le stock
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: parseFloat(item.quantity),
              },
            },
          })

          // Créer un mouvement de stock
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              userId,
              type: "SALE",
              quantity: -parseFloat(item.quantity),
              reason: "Vente",
              saleId: sale.id,
            },
          })
        }

        // Mettre à jour le solde du client si crédit
        if (paymentMethod === "CREDIT" && clientId && remainingAmount > 0) {
          await tx.client.update({
            where: { id: clientId },
            data: {
              soldeActuel: {
                increment: remainingAmount,
              },
            },
          })
        }
      }

      return { sale, requiresApproval: needsApproval && !isApproved }

      // Mettre à jour le stock et créer les mouvements
      for (const item of items) {
        const product = await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: parseFloat(item.quantity),
            },
          },
        })

        // Créer un mouvement de stock
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            userId,
            type: "SALE",
            quantity: -parseFloat(item.quantity),
            reason: "Vente",
            saleId: sale.id,
          },
        })
      }

      return sale
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error("Error creating sale:", error)
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const sales = await prisma.sale.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

