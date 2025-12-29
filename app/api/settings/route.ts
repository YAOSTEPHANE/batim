import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Récupérer les paramètres
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Récupérer les statistiques générales
    const [
      totalProducts,
      totalCategories,
      totalBrands,
      totalSuppliers,
      totalClients,
      totalUsers,
      totalSales,
    ] = await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.category.count(),
      prisma.brand.count(),
      prisma.supplier.count({ where: { active: true } }),
      prisma.client.count(),
      prisma.user.count({ where: { active: true } }),
      prisma.sale.count(),
    ])

    // Calculer les produits en rupture de stock
    const allProducts = await prisma.product.findMany({
      where: { active: true },
      select: { quantity: true, minThreshold: true, purchasePrice: true, sellingPrice: true }
    })
    const lowStockProducts = allProducts.filter(p => p.quantity <= p.minThreshold).length

    // Calculer la valeur du stock
    const stockValuePurchase = allProducts.reduce(
      (sum, p) => sum + p.quantity * p.purchasePrice, 0
    )
    const stockValueSelling = allProducts.reduce(
      (sum, p) => sum + p.quantity * p.sellingPrice, 0
    )

    return NextResponse.json({
      statistics: {
        totalProducts,
        totalCategories,
        totalBrands,
        totalSuppliers,
        totalClients,
        totalUsers,
        totalSales,
        lowStockProducts,
        stockValuePurchase,
        stockValueSelling,
        potentialProfit: stockValueSelling - stockValuePurchase,
      },
      businessRules: {
        adminApprovalThreshold: 500000,
        creditOverdueDaysBlock: 90,
        defaultCreditLimit: 100000,
        lowStockAlertThreshold: 10,
      },
      company: {
        name: "Ma Quincaillerie",
        address: "123 Rue du Commerce",
        phone: "+225 00 00 00 00",
        email: "contact@quincaillerie.com",
        currency: "FCFA",
        taxRate: 18,
      }
    })
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT - Mettre à jour les paramètres (Admin uniquement)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    
    // Pour l'instant, on retourne simplement les données mises à jour
    // Dans une vraie application, on sauvegarderait dans une table Settings
    return NextResponse.json({
      message: "Paramètres mis à jour",
      data: body
    })
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

