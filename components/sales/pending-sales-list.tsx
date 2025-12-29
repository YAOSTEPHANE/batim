"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface PendingSale {
  id: string
  saleNumber: string
  client?: {
    name: string
    phone: string
  }
  total: number
  remainingAmount: number
  createdAt: string
  items: Array<{
    product: {
      name: string
    }
    quantity: number
    unitPrice: number
  }>
}

export function PendingSalesList() {
  const { toast } = useToast()
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingSales()
  }, [])

  const fetchPendingSales = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/sales/pending")
      const data = await res.json()
      setPendingSales(data)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les ventes en attente",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (saleId: string) => {
    try {
      const res = await fetch(`/api/sales/${saleId}/approve`, {
        method: "POST",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Erreur")
      }

      toast({
        title: "Vente approuvée",
        description: "La vente a été approuvée et le stock a été mis à jour",
      })

      fetchPendingSales()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'approuver la vente",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (saleId: string) => {
    // TODO: Implémenter le rejet de vente
    toast({
      title: "Fonctionnalité à venir",
      description: "Le rejet de vente sera disponible prochainement",
    })
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Chargement...
      </div>
    )
  }

  if (pendingSales.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <p className="text-muted-foreground">
          Aucune vente en attente d'approbation
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pendingSales.map((sale) => (
        <Card key={sale.id} className="border-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold">{sale.saleNumber}</h3>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                    En attente
                  </span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>
                    <strong>Client:</strong> {sale.client?.name || "Client anonyme"} (
                    {sale.client?.phone || "N/A"})
                  </div>
                  <div>
                    <strong>Date:</strong> {formatDateTime(sale.createdAt)}
                  </div>
                  <div>
                    <strong>Total:</strong> {formatCurrency(sale.total)}
                  </div>
                  <div>
                    <strong>Reste à payer:</strong>{" "}
                    <span className="font-bold text-orange-600">
                      {formatCurrency(sale.remainingAmount)}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-sm font-medium mb-1">Articles:</div>
                  <div className="space-y-1 text-sm">
                    {sale.items.map((item, idx) => (
                      <div key={idx} className="text-muted-foreground">
                        {item.product.name} - {item.quantity} ×{" "}
                        {formatCurrency(item.unitPrice)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="ml-4 flex gap-2">
                <Button
                  variant="default"
                  onClick={() => handleApprove(sale.id)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approuver
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReject(sale.id)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejeter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}




