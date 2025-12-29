import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { MainLayout } from "@/components/layout/main-layout"
import { ProductsList } from "@/components/products/products-list"

export default async function ProductsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const userRole = (session.user as any).role
  if (userRole !== "ADMIN" && userRole !== "STOCK_MANAGER") {
    redirect("/dashboard")
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Produits</h1>
            <p className="text-muted-foreground">
              Catalogue complet de vos produits
            </p>
          </div>
        </div>
        <ProductsList />
      </div>
    </MainLayout>
  )
}




