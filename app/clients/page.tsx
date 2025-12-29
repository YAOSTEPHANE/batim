import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { MainLayout } from "@/components/layout/main-layout"
import { ClientsList } from "@/components/clients/clients-list"

export default async function ClientsPage() {
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
          <h1 className="text-3xl font-bold">Gestion des Clients</h1>
          <p className="text-muted-foreground">
            Gérer les clients et leurs limites de crédit
          </p>
        </div>
        <ClientsList />
      </div>
    </MainLayout>
  )
}




