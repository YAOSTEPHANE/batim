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
    const search = searchParams.get("search")

    const where: any = {
      active: true,
    }

    if (search) {
      // MongoDB avec Prisma utilise contains sans mode pour la recherche case-insensitive
      // On peut utiliser une regex ou simplement contains (MongoDB est case-insensitive par défaut pour les index)
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { barcode: { contains: search } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        brand: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku,
        barcode,
        categoryId,
        brandId: brandId || null,
        unitType: unitType || "UNIT",
        unitLabel: unitLabel || "unité",
        purchasePrice: parseFloat(purchasePrice),
        sellingPrice: parseFloat(sellingPrice),
        minThreshold: parseFloat(minThreshold) || 0,
        imageUrl: imageUrl || null,
        quantity: 0,
      },
      include: {
        category: true,
        brand: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error("Error creating product:", error)
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

