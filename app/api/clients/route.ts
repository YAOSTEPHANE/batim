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
    const status = searchParams.get("status")

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ]
    }

    if (status) {
      where.status = status
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching clients:", error)
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
    const { name, phone, email, address, photoUrl, limiteCredit, status } = body

    const client = await prisma.client.create({
      data: {
        name,
        phone,
        email: email || null,
        address: address || null,
        photoUrl: photoUrl || null,
        limiteCredit: parseFloat(limiteCredit) || 0,
        status: status || "ACTIVE",
        soldeActuel: 0,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error: any) {
    console.error("Error creating client:", error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Un client avec ce numéro de téléphone existe déjà" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}




