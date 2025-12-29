"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { DollarSign, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { PaymentDialog } from "@/components/unpaid/payment-dialog"

interface Payment {
  id: string
  amount: number
  paymentMethod: string
  notes?: string
  createdAt: string
  sale?: {
    saleNumber: string
  }
  user: {
    name: string
  }
}

interface ClientPaymentsListProps {
  clientId: string
  client: {
    id: string
    name: string
    phone: string
    soldeActuel: number
    limiteCredit: number
  }
}

export function ClientPaymentsList({ clientId, client }: ClientPaymentsListProps) {
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [unpaidSales, setUnpaidSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [clientId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [paymentsRes, salesRes] = await Promise.all([
        fetch(`/api/payments?clientId=${clientId}`),
        fetch(`/api/sales/unpaid?clientId=${clientId}`),
      ])

      const paymentsData = await paymentsRes.json()
      const salesData = await salesRes.json()

      setPayments(paymentsData)
      setUnpaidSales(salesData.filter((s: any) => s.client?.id === clientId))
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Solde Actuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(client.soldeActuel)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Versé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPaid)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ventes Impayées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaidSales.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Ventes impayées */}
      {unpaidSales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ventes Impayées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unpaidSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <div className="font-medium">{sale.saleNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateTime(sale.createdAt)} • Reste:{" "}
                      {formatCurrency(sale.remainingAmount)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedSale(sale)
                      setPaymentDialogOpen(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Paiement
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historique des versements */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Versements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Chargement...
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun versement enregistré</p>
            </div>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <div className="font-medium">
                      {formatCurrency(payment.amount)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {payment.sale?.saleNumber && `Vente ${payment.sale.saleNumber} • `}
                      {formatDateTime(payment.createdAt)} • {payment.user.name}
                    </div>
                    {payment.notes && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {payment.notes}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {payment.paymentMethod}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        sale={selectedSale}
        onSuccess={fetchData}
      />
    </div>
  )
}




