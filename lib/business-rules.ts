/**
 * Règles métier pour la gestion des crédits
 */

// Seuil de montant pour validation admin (en FCFA)
export const ADMIN_APPROVAL_THRESHOLD = 500000 // 500 000 FCFA

// Nombre de jours par défaut avant blocage automatique
export const DEFAULT_AUTO_BLOCK_DAYS = 90

/**
 * Vérifie si une vente à crédit nécessite une validation admin
 */
export function requiresAdminApproval(amount: number): boolean {
  return amount > ADMIN_APPROVAL_THRESHOLD
}

/**
 * Vérifie si un client doit être bloqué automatiquement
 * basé sur ses factures impayées
 */
export async function shouldAutoBlockClient(
  clientId: string,
  prisma: any,
  customDays?: number
): Promise<{ shouldBlock: boolean; oldestUnpaidDays: number }> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      sales: {
        where: {
          isPaid: false,
          remainingAmount: { gt: 0 },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  })

  if (!client || client.sales.length === 0) {
    return { shouldBlock: false, oldestUnpaidDays: 0 }
  }

  // Trouver la facture la plus ancienne impayée
  const oldestUnpaid = client.sales[0]
  const today = new Date()
  const dueDate = oldestUnpaid.dueDate || oldestUnpaid.createdAt
  const daysSinceDue = Math.floor(
    (today.getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  // Utiliser le seuil personnalisé du client ou le défaut
  const blockDays = client.autoBlockDays || customDays || DEFAULT_AUTO_BLOCK_DAYS

  return {
    shouldBlock: daysSinceDue > blockDays,
    oldestUnpaidDays: daysSinceDue,
  }
}

/**
 * Met à jour automatiquement le statut des clients
 * basé sur leurs factures impayées
 */
export async function updateClientStatuses(prisma: any) {
  const clients = await prisma.client.findMany({
    where: {
      status: "ACTIVE",
      soldeActuel: { gt: 0 },
    },
    include: {
      sales: {
        where: {
          isPaid: false,
          remainingAmount: { gt: 0 },
        },
      },
    },
  })

  for (const client of clients) {
    const { shouldBlock, oldestUnpaidDays } = await shouldAutoBlockClient(
      client.id,
      prisma
    )

    if (shouldBlock && client.status === "ACTIVE") {
      await prisma.client.update({
        where: { id: client.id },
        data: {
          status: "BLOCKED",
          notes: `Blocage automatique: facture impayée depuis ${oldestUnpaidDays} jours`,
        },
      })
    }
  }
}




