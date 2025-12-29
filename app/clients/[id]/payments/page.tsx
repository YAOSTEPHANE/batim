import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { MainLayout } from "@/components/layout/main-layout"
import { ClientPaymentsList } from "@/components/clients/client-payments-list"
import { prisma } from "@/lib/prisma"

export default async function ClientPaymentsPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      phone: true,
      soldeActuel: true,
      limiteCredit: true,
    },
  })

  if (!client) {
    redirect("/clients")
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Historique des Versements</h1>
          <p className="text-muted-foreground">
            Client: {client.name} ({client.phone})
          </p>
        </div>
        <ClientPaymentsList clientId={params.id} client={client} />
      </div>
    </MainLayout>
  )
}




