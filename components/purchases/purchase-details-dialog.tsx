"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { 
  Package, 
  Building2, 
  Calendar, 
  Truck, 
  User, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Hash,
  Banknote,
  StickyNote
} from "lucide-react"

interface PurchaseOrder {
  id: string
  orderNumber: string
  supplier: { id: string; name: string }
  user: { id: string; name: string }
  totalAmount: number
  status: string
  orderDate: string
  deliveryDate: string | null
  notes?: string
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    totalPrice: number
    product: { id: string; name: string; sku: string }
  }>
}

interface PurchaseDetailsDialogProps {
  purchase: PurchaseOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PurchaseDetailsDialog({
  purchase,
  open,
  onOpenChange,
}: PurchaseDetailsDialogProps) {
  if (!purchase) return null

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          label: "En attente",
          icon: Clock,
          bgColor: "bg-gradient-to-r from-amber-100 to-orange-100",
          textColor: "text-amber-700",
          borderColor: "border-amber-300"
        }
      case "RECEIVED":
        return {
          label: "Reçue",
          icon: CheckCircle,
          bgColor: "bg-gradient-to-r from-emerald-100 to-green-100",
          textColor: "text-emerald-700",
          borderColor: "border-emerald-300"
        }
      case "CANCELLED":
        return {
          label: "Annulée",
          icon: XCircle,
          bgColor: "bg-gradient-to-r from-red-100 to-rose-100",
          textColor: "text-red-700",
          borderColor: "border-red-300"
        }
      default:
        return {
          label: status,
          icon: Clock,
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          borderColor: "border-gray-300"
        }
    }
  }

  const statusConfig = getStatusConfig(purchase.status)
  const StatusIcon = statusConfig.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header avec gradient */}
        <div className="relative -mx-6 -mt-6 px-6 pt-6 pb-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-t-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white">
                    Bon de commande {purchase.orderNumber}
                  </DialogTitle>
                  <p className="text-purple-100 mt-1">Détails de la commande</p>
                </div>
              </div>
            </DialogHeader>
          </div>
        </div>

        <div className="space-y-6 mt-4">
          {/* Statut en évidence */}
          <div className="flex justify-center">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor} border-2 ${statusConfig.borderColor} shadow-sm`}>
              <StatusIcon className="h-5 w-5" />
              <span className="font-semibold text-lg">{statusConfig.label}</span>
            </div>
          </div>

          {/* Informations générales */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Building2 className="h-4 w-4" />
                <span className="text-sm font-medium">Fournisseur</span>
              </div>
              <p className="font-semibold text-gray-800">{purchase.supplier.name}</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-200">
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Date de commande</span>
              </div>
              <p className="font-semibold text-gray-800">
                {format(new Date(purchase.orderDate), "dd MMMM yyyy", { locale: fr })}
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <Truck className="h-4 w-4" />
                <span className="text-sm font-medium">Livraison prévue</span>
              </div>
              <p className="font-semibold text-gray-800">
                {purchase.deliveryDate
                  ? format(new Date(purchase.deliveryDate), "dd MMMM yyyy", { locale: fr })
                  : "Non définie"}
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Créé par</span>
              </div>
              <p className="font-semibold text-gray-800">{purchase.user.name}</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200 col-span-2 md:col-span-2">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Banknote className="h-4 w-4" />
                <span className="text-sm font-medium">Montant total</span>
              </div>
              <p className="font-bold text-2xl text-gray-800">{formatCurrency(purchase.totalAmount)}</p>
            </div>
          </div>

          {/* Liste des articles */}
          <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-slate-100 to-purple-100/50 border-b border-slate-200">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-purple-500" />
                Articles commandés ({purchase.items.length})
              </h4>
            </div>
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-purple-500" />
                        Produit
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-blue-500" />
                        SKU
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-semibold">Quantité</TableHead>
                    <TableHead className="text-right font-semibold">Prix unitaire</TableHead>
                    <TableHead className="text-right font-semibold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchase.items.map((item, index) => (
                    <TableRow 
                      key={item.id}
                      className="hover:bg-purple-50/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-800">{item.product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-mono">
                          {item.product.sku}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-semibold">
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-gray-800">
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Total récapitulatif */}
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg">
                  <span className="text-purple-100 text-sm">Total:</span>
                  <span className="ml-2 font-bold text-xl">{formatCurrency(purchase.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {purchase.notes && (
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <StickyNote className="h-4 w-4" />
                <span className="text-sm font-medium">Notes</span>
              </div>
              <p className="text-gray-700">{purchase.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
