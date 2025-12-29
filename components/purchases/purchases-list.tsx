"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Package,
  Clock,
  Truck,
  Calendar,
  User,
  Building2,
  FileText,
  AlertCircle,
  ArrowRight,
  Sparkles
} from "lucide-react"
import { PurchaseDetailsDialog } from "./purchase-details-dialog"
import { Progress } from "@/components/ui/progress"

interface PurchaseOrder {
  id: string
  orderNumber: string
  supplier: { id: string; name: string }
  user: { id: string; name: string }
  totalAmount: number
  status: string
  orderDate: string
  deliveryDate: string | null
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    totalPrice: number
    product: { id: string; name: string; sku: string }
  }>
}

interface PurchasesListProps {
  onRefresh?: () => void
}

export function PurchasesList({ onRefresh }: PurchasesListProps) {
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseOrder | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchPurchases = async () => {
    try {
      const response = await fetch("/api/purchases")
      if (response.ok) {
        const data = await response.json()
        setPurchases(data)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les bons de commande",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPurchases()
  }, [])

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    try {
      const response = await fetch(`/api/purchases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "✅ Succès",
          description: status === "RECEIVED" 
            ? "Commande reçue et stock mis à jour" 
            : status === "CANCELLED"
            ? "Commande annulée"
            : "Statut mis à jour",
        })
        fetchPurchases()
        onRefresh?.()
      } else {
        throw new Error()
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          label: "En attente",
          icon: Clock,
          bgColor: "bg-gradient-to-r from-amber-100 to-orange-100",
          textColor: "text-amber-700",
          borderColor: "border-amber-300",
          iconColor: "text-amber-500",
          progress: 33
        }
      case "RECEIVED":
        return {
          label: "Reçue",
          icon: CheckCircle,
          bgColor: "bg-gradient-to-r from-emerald-100 to-green-100",
          textColor: "text-emerald-700",
          borderColor: "border-emerald-300",
          iconColor: "text-emerald-500",
          progress: 100
        }
      case "CANCELLED":
        return {
          label: "Annulée",
          icon: XCircle,
          bgColor: "bg-gradient-to-r from-red-100 to-rose-100",
          textColor: "text-red-700",
          borderColor: "border-red-300",
          iconColor: "text-red-500",
          progress: 0
        }
      default:
        return {
          label: status,
          icon: AlertCircle,
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          borderColor: "border-gray-300",
          iconColor: "text-gray-500",
          progress: 0
        }
    }
  }

  const getDaysUntilDelivery = (deliveryDate: string | null) => {
    if (!deliveryDate) return null
    const today = new Date()
    const delivery = new Date(deliveryDate)
    const diffTime = delivery.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <Package className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-gray-500 animate-pulse">Chargement des commandes...</p>
      </div>
    )
  }

  if (purchases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="p-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full">
          <Package className="h-12 w-12 text-purple-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800">Aucun bon de commande</h3>
          <p className="text-gray-500 mt-1">Créez votre premier bon de commande pour commencer</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 to-purple-50/50 hover:from-slate-100 hover:to-purple-100/50">
              <TableHead className="font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  N° Commande
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  Fournisseur
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  Date
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-amber-500" />
                  Livraison
                </div>
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Montant</TableHead>
              <TableHead className="font-semibold text-gray-700">Progression</TableHead>
              <TableHead className="font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  Créé par
                </div>
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase, index) => {
              const statusConfig = getStatusConfig(purchase.status)
              const StatusIcon = statusConfig.icon
              const daysUntilDelivery = getDaysUntilDelivery(purchase.deliveryDate)
              
              return (
                <TableRow 
                  key={purchase.id}
                  className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 transition-all duration-300"
                  style={{ 
                    animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg text-white shadow-sm group-hover:shadow-md transition-shadow">
                        <Package className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-gray-800">{purchase.orderNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {purchase.supplier.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-700">{purchase.supplier.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">
                      {format(new Date(purchase.orderDate), "dd MMM yyyy", { locale: fr })}
                    </span>
                  </TableCell>
                  <TableCell>
                    {purchase.deliveryDate ? (
                      <div className="space-y-1">
                        <span className="text-gray-600 text-sm">
                          {format(new Date(purchase.deliveryDate), "dd MMM yyyy", { locale: fr })}
                        </span>
                        {purchase.status === "PENDING" && daysUntilDelivery !== null && (
                          <div className={`text-xs font-medium ${
                            daysUntilDelivery < 0 
                              ? 'text-red-500' 
                              : daysUntilDelivery <= 3 
                              ? 'text-amber-500' 
                              : 'text-emerald-500'
                          }`}>
                            {daysUntilDelivery < 0 
                              ? `${Math.abs(daysUntilDelivery)}j de retard` 
                              : daysUntilDelivery === 0 
                              ? "Aujourd'hui" 
                              : `Dans ${daysUntilDelivery}j`}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-gray-800 bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-1 rounded-lg">
                      {formatCurrency(purchase.totalAmount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2 min-w-[140px]">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                        <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor}`} />
                        <span className="text-sm font-medium">{statusConfig.label}</span>
                      </div>
                      {purchase.status !== "CANCELLED" && (
                        <Progress 
                          value={statusConfig.progress} 
                          className="h-1.5"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs">
                        {purchase.user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-600 text-sm">{purchase.user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-9 w-9 p-0 hover:bg-purple-100 hover:text-purple-600 transition-colors rounded-lg"
                          disabled={updatingId === purchase.id}
                        >
                          {updatingId === purchase.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedPurchase(purchase)
                            setDetailsOpen(true)
                          }}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4 text-blue-500" />
                          <span>Voir les détails</span>
                        </DropdownMenuItem>
                        
                        {purchase.status === "PENDING" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => updateStatus(purchase.id, "RECEIVED")}
                              className="cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              <span>Marquer comme reçue</span>
                              <ArrowRight className="ml-auto h-4 w-4" />
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateStatus(purchase.id, "CANCELLED")}
                              className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              <span>Annuler la commande</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <PurchaseDetailsDialog
        purchase={selectedPurchase}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}
