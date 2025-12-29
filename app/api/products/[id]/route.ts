import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "ADMIN" && userRole !== "STOCK_MANAGER") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      sku,
      barcode,
      categoryId,
      brandId,
      unitType,
      unitLabel,
      purchasePrice,
      sellingPrice,
      minThreshold,
      imageUrl,
    } = body

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
        sku,
        barcode: barcode || null,
        categoryId,
        brandId: brandId || null,
        unitType: unitType || "UNIT",
        unitLabel: unitLabel || "unité",
        purchasePrice: parseFloat(purchasePrice),
        sellingPrice: parseFloat(sellingPrice),
        minThreshold: parseFloat(minThreshold) || 0,
        imageUrl: imageUrl || null,
      },
      include: {
        category: true,
        brand: true,
      },
    })

    return NextResponse.json(product)
  } catch (error: any) {
    console.error("Error updating product:", error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "SKU ou code-barres déjà existant" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "ADMIN" && userRole !== "STOCK_MANAGER") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    await prisma.product.update({
      where: { id: params.id },
      data: {
        active: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}




