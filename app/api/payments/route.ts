import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { saleId, clientId, amount, paymentMethod, notes } = body

    // Vérifier que la vente existe et n'est pas entièrement payée
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
    })

    if (!sale) {
      return NextResponse.json(
        { error: "Vente non trouvée" },
        { status: 404 }
      )
    }

    if (parseFloat(amount) > sale.remainingAmount) {
      return NextResponse.json(
        { error: "Le montant dépasse le reste à payer" },
        { status: 400 }
      )
    }

    // Créer le paiement et mettre à jour la vente dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer le paiement
      const payment = await tx.payment.create({
        data: {
          clientId: clientId || null,
          saleId,
          userId,
          amount: parseFloat(amount),
          paymentMethod,
          notes: notes || null,
        },
      })

      // Mettre à jour la vente
      const newRemainingAmount = sale.remainingAmount - parseFloat(amount)
      const updatedSale = await tx.sale.update({
        where: { id: saleId },
        data: {
          amountPaid: sale.amountPaid + parseFloat(amount),
          remainingAmount: newRemainingAmount,
          isPaid: newRemainingAmount <= 0,
        },
      })

      // Mettre à jour le solde du client si applicable
      if (clientId) {
        await tx.client.update({
          where: { id: clientId },
          data: {
            soldeActuel: {
              decrement: parseFloat(amount),
            },
          },
        })
      }

      return { payment, sale: updatedSale }
    })

    return NextResponse.json(result.payment, { status: 201 })
  } catch (error: any) {
    console.error("Error creating payment:", error)
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
    const clientId = searchParams.get("clientId")
    const saleId = searchParams.get("saleId")

    const where: any = {}
    if (clientId) where.clientId = clientId
    if (saleId) where.saleId = saleId

    const payments = await prisma.payment.findMany({
      where,
      include: {
        client: {
          select: {
            name: true,
            phone: true,
          },
        },
        sale: {
          select: {
            saleNumber: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}




