"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { 
  Banknote, 
  CreditCard, 
  Smartphone, 
  Wallet, 
  CheckCircle, 
  Receipt,
  ArrowRight,
  Sparkles,
  AlertCircle,
  User,
  FileText
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

const paymentSchema = z.object({
  amount: z.string().min(0.01, "Le montant doit être supérieur à 0"),
  paymentMethod: z.enum(["CASH", "MOBILE_MONEY", "CARD"]),
  notes: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale?: any
  onSuccess: () => void
}

const paymentMethods = [
  { value: "CASH", label: "Espèces", icon: Banknote, color: "from-green-500 to-emerald-500", bgColor: "bg-green-50", borderColor: "border-green-500", textColor: "text-green-600" },
  { value: "MOBILE_MONEY", label: "Mobile Money", icon: Smartphone, color: "from-orange-500 to-amber-500", bgColor: "bg-orange-50", borderColor: "border-orange-500", textColor: "text-orange-600" },
  { value: "CARD", label: "Carte", icon: CreditCard, color: "from-blue-500 to-indigo-500", bgColor: "bg-blue-50", borderColor: "border-blue-500", textColor: "text-blue-600" },
]

export function PaymentDialog({
  open,
  onOpenChange,
  sale,
  onSuccess,
}: PaymentDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState("CASH")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "CASH",
    },
  })

  const amountPaid = watch("amount")
  const remainingAfter = sale
    ? sale.remainingAmount - (parseFloat(amountPaid || "0") || 0)
    : 0
  const progressPercent = sale && amountPaid 
    ? Math.min(100, ((sale.amountPaid + parseFloat(amountPaid || "0")) / sale.total) * 100)
    : sale 
    ? (sale.amountPaid / sale.total) * 100 
    : 0

  useEffect(() => {
    if (open && sale) {
      reset({
        amount: sale.remainingAmount.toString(),
        paymentMethod: "CASH",
        notes: "",
      })
      setSelectedMethod("CASH")
    }
  }, [open, sale, reset])

  const onSubmit = async (data: PaymentFormData) => {
    if (!sale) return

    const amount = parseFloat(data.amount)
    if (amount > sale.remainingAmount) {
      toast({
        title: "Erreur",
        description: "Le montant ne peut pas dépasser le reste à payer",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saleId: sale.id,
          clientId: sale.client?.id || null,
          amount,
          paymentMethod: data.paymentMethod,
          notes: data.notes || null,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Erreur")
      }

      toast({
        title: "✅ Paiement enregistré",
        description: `Paiement de ${formatCurrency(amount)} enregistré avec succès`,
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!sale) return null

  const clientName = sale.client?.name || sale.customerName || "Client anonyme"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden">
        {/* Header avec gradient */}
        <div className="relative -mx-6 -mt-6 px-6 pt-6 pb-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-t-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Banknote className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                    Enregistrer un Paiement
                    <Sparkles className="h-5 w-5 text-yellow-300" />
                  </DialogTitle>
                  <DialogDescription className="text-green-100">
                    Vente {sale.saleNumber}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          {/* Info client et vente */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <User className="h-4 w-4" />
                <span className="text-xs font-medium">Client</span>
              </div>
              <p className="font-semibold text-gray-800 truncate">{clientName}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-50 to-rose-100 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 text-red-500 mb-1">
                <Receipt className="h-4 w-4" />
                <span className="text-xs font-medium">Reste à payer</span>
              </div>
              <p className="font-bold text-red-600">{formatCurrency(sale.remainingAmount)}</p>
            </div>
          </div>

          {/* Montant */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2 text-gray-700">
              <Wallet className="h-4 w-4 text-green-500" />
              Montant du paiement (FCFA)
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount")}
                placeholder={sale.remainingAmount.toString()}
                className="pl-12 h-12 text-lg font-semibold border-2 focus:border-green-500 focus:ring-green-500/20"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Banknote className="h-5 w-5" />
              </div>
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.amount.message}
              </p>
            )}
            
            {/* Progression visuelle */}
            {amountPaid && (
              <div className="p-3 bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Progression du remboursement</span>
                  <span className="font-bold text-green-600">{progressPercent.toFixed(0)}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Après ce paiement:
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      remainingAfter < 0
                        ? "text-red-600"
                        : remainingAfter === 0
                        ? "text-green-600"
                        : "text-gray-700"
                    }`}
                  >
                    {remainingAfter <= 0 ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Soldé !
                      </span>
                    ) : (
                      formatCurrency(remainingAfter)
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Méthode de paiement */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-700">
              <CreditCard className="h-4 w-4 text-blue-500" />
              Méthode de paiement
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                const isSelected = selectedMethod === method.value
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => {
                      setSelectedMethod(method.value)
                      setValue("paymentMethod", method.value as any)
                    }}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                      isSelected
                        ? `${method.bgColor} ${method.borderColor} ${method.textColor} shadow-lg scale-105`
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`p-2 rounded-lg ${isSelected ? `bg-gradient-to-br ${method.color} text-white` : "bg-gray-100"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium">{method.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>
            <input type="hidden" {...register("paymentMethod")} value={selectedMethod} />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2 text-gray-700">
              <FileText className="h-4 w-4 text-gray-500" />
              Notes (optionnel)
            </Label>
            <Input 
              id="notes" 
              {...register("notes")} 
              placeholder="Référence, commentaire..."
              className="border-2 focus:border-gray-400"
            />
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Confirmer le paiement
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
