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
        { error: "Seul un administrateur peut rejeter une vente" },
        { status: 403 }
      )
    }

    // Récupérer la vente
    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
      include: {
        items: true,
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

    // Supprimer la vente et ses items
    await prisma.$transaction(async (tx) => {
      // Supprimer les items de la vente
      await tx.saleItem.deleteMany({
        where: { saleId: sale.id },
      })

      // Supprimer la vente
      await tx.sale.delete({
        where: { id: sale.id },
      })
    })

    return NextResponse.json({ 
      success: true, 
      message: "Vente rejetée et supprimée" 
    })
  } catch (error: any) {
    console.error("Error rejecting sale:", error)
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    )
  }
}




