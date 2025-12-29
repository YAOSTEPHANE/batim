import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { MainLayout } from "@/components/layout/main-layout"
import { SuppliersList } from "@/components/suppliers/suppliers-list"

export default async function SuppliersPage() {
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
        <div>
          <h1 className="text-3xl font-bold">Fournisseurs</h1>
          <p className="text-muted-foreground">
            Gérer vos fournisseurs et leurs informations
          </p>
        </div>
        <SuppliersList />
      </div>
    </MainLayout>
  )
}




