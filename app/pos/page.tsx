"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  X, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Clock,
  User,
  Package,
  Sparkles,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Tag,
  Percent,
  Calendar,
  UserCheck,
  BadgeDollarSign
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ReceiptDialog } from "@/components/pos/receipt-dialog"

interface CartItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  unitLabel: string
  discount: number
  total: number
}

interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  sellingPrice: number
  quantity: number
  unitLabel: string
  imageUrl?: string
  category?: { name: string }
}

const paymentMethods = [
  { value: "CASH", label: "Espèces", icon: Banknote, color: "from-green-500 to-emerald-500", bgColor: "bg-green-500/10" },
  { value: "MOBILE_MONEY", label: "Mobile Money", icon: Smartphone, color: "from-orange-500 to-amber-500", bgColor: "bg-orange-500/10" },
  { value: "CARD", label: "Carte", icon: CreditCard, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500/10" },
  { value: "CREDIT", label: "Crédit", icon: Clock, color: "from-red-500 to-pink-500", bgColor: "bg-red-500/10" },
]

export default function POSPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent")
  const [discountValue, setDiscountValue] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [amountPaid, setAmountPaid] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [clientSearch, setClientSearch] = useState("")
  const [clients, setClients] = useState<any[]>([])
  const [dueDate, setDueDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastSale, setLastSale] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    fetchProducts()
    fetchClients()
  }, [])

  // Calculate totals for display and auto-fill
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const totalDiscount = cart.reduce((sum, item) => sum + item.discount, 0)
  const cartDiscount = discountType === "percent"
    ? subtotal * (parseFloat(discountValue) / 100 || 0)
    : parseFloat(discountValue) || 0
  const total = subtotal - totalDiscount - cartDiscount
  
  // For non-credit payments, use total as default if amountPaid is empty
  const effectivePaidAmount = paymentMethod === "CREDIT" 
    ? (parseFloat(amountPaid) || 0)
    : (amountPaid && amountPaid !== "" && amountPaid !== "0" ? parseFloat(amountPaid) : total)
  
  const paidAmount = effectivePaidAmount
  const remainingAmount = paymentMethod === "CREDIT" ? total - paidAmount : 0
  const change = paymentMethod !== "CREDIT" ? Math.max(0, paidAmount - total) : 0

  // Calculate the display value for amount paid
  // For non-credit payments, show total if user hasn't entered anything
  // For credit, let user enter partial payment
  const getDisplayAmountPaid = () => {
    if (paymentMethod === "CREDIT") {
      return amountPaid
    }
    // For non-credit payments, show total if cart has items and user hasn't modified the amount
    if (cart.length > 0 && total > 0 && (amountPaid === "" || amountPaid === "0")) {
      return total.toString()
    }
    return amountPaid
  }
  const displayAmountPaid = getDisplayAmountPaid()

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients?status=ACTIVE")
      const data = await res.json()
      setClients(data)
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const handleClientSearch = (query: string) => {
    setClientSearch(query)
    if (query.length < 2) {
      setSelectedClient(null)
      return
    }
    const filtered = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone?.includes(query)
    )
    if (filtered.length === 1) {
      setSelectedClient(filtered[0])
    } else {
      setSelectedClient(null)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products")
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive",
      })
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      fetchProducts()
      return
    }

    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`)
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error("Search error:", error)
    }
  }

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
      toast({
        title: "Stock insuffisant",
        description: "Ce produit n'est plus en stock",
        variant: "destructive",
      })
      return
    }

    const existingItem = cart.find((item) => item.id === product.id)

    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        toast({
          title: "Stock insuffisant",
          description: "Quantité disponible dépassée",
          variant: "destructive",
        })
        return
      }
      updateCartQuantity(product.id, existingItem.quantity + 1)
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        quantity: 1,
        unitPrice: product.sellingPrice,
        unitLabel: product.unitLabel,
        discount: 0,
        total: product.sellingPrice,
      }
      setCart([...cart, newItem])
    }
  }

  const updateCartQuantity = (id: string, quantity: number) => {
    const product = products.find((p) => p.id === id)
    if (product && quantity > product.quantity) {
      toast({
        title: "Stock insuffisant",
        description: "Quantité disponible dépassée",
        variant: "destructive",
      })
      return
    }

    setCart(
      cart.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(0, quantity)
          const newTotal = (item.unitPrice * newQuantity) - item.discount
          return { ...item, quantity: newQuantity, total: Math.max(0, newTotal) }
        }
        return item
      })
    )
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const canUseCredit = selectedClient
    ? selectedClient.limiteCredit === 0 ||
      selectedClient.soldeActuel + remainingAmount <= selectedClient.limiteCredit
    : true

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des produits au panier",
        variant: "destructive",
      })
      return
    }

    if (paymentMethod === "CREDIT") {
      if (!selectedClient && !customerName) {
        toast({
          title: "Client requis",
          description: "Veuillez sélectionner ou saisir un client pour un paiement à crédit",
          variant: "destructive",
        })
        return
      }

      if (selectedClient && !canUseCredit) {
        toast({
          title: "Limite de crédit dépassée",
          description: `Le solde dépasse la limite autorisée`,
          variant: "destructive",
        })
        return
      }

      if (selectedClient && (selectedClient.status === "BLOCKED" || selectedClient.status === "LITIGATION")) {
        toast({
          title: "Compte bloqué",
          description: `Le compte de ce client est ${selectedClient.status === "BLOCKED" ? "bloqué" : "en contentieux"}`,
          variant: "destructive",
        })
        return
      }
    }

    // For non-credit payments, validate that paid amount covers total
    // Note: effectivePaidAmount defaults to total if amountPaid is empty
    if (paymentMethod !== "CREDIT" && paidAmount < total) {
      toast({
        title: "Montant insuffisant",
        description: "Le montant payé doit être supérieur ou égal au total",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            total: item.total,
          })),
          subtotal,
          discountAmount: totalDiscount + cartDiscount,
          discountPercent: discountType === "percent" ? parseFloat(discountValue) : null,
          total,
          paymentMethod,
          amountPaid: paymentMethod === "CREDIT" ? paidAmount : paidAmount,
          change: paymentMethod === "CREDIT" ? 0 : change,
          clientId: selectedClient?.id || null,
          customerName: paymentMethod === "CREDIT" && !selectedClient ? customerName : null,
          customerPhone: selectedClient?.phone || null,
          dueDate: paymentMethod === "CREDIT" && dueDate ? dueDate : null,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Erreur lors de la vente")
      }

      const response = await res.json()
      // L'API peut retourner { sale, requiresApproval } ou directement sale
      const sale = response.sale || response

      // Préparer les données du reçu
      const saleWithDetails = {
        id: sale.id,
        saleNumber: sale.saleNumber,
        createdAt: sale.createdAt || new Date().toISOString(),
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unitLabel: item.unitLabel,
          discount: item.discount,
          total: item.total,
        })),
        subtotal,
        discountAmount: totalDiscount + cartDiscount,
        discountPercent: discountType === "percent" ? parseFloat(discountValue) : null,
        total,
        paymentMethod,
        amountPaid: paidAmount,
        change: paymentMethod === "CREDIT" ? 0 : change,
        remainingAmount: paymentMethod === "CREDIT" ? remainingAmount : 0,
        customerName: paymentMethod === "CREDIT" && !selectedClient ? customerName : null,
        clientName: selectedClient?.name || null,
        customerPhone: selectedClient?.phone || null,
        dueDate: paymentMethod === "CREDIT" && dueDate ? dueDate : null,
        user: { name: session?.user?.name || "Vendeur" },
      }

      setLastSale(saleWithDetails)
      setShowReceipt(true)

      toast({
        title: "✨ Vente effectuée !",
        description: `Vente ${sale.saleNumber || saleWithDetails.saleNumber} enregistrée avec succès`,
      })

      // Réinitialiser
      setCart([])
      setDiscountValue("")
      setAmountPaid("")
      setCustomerName("")
      setSelectedClient(null)
      setClientSearch("")
      setDueDate("")
      setSearchQuery("")
      fetchProducts()
      if (selectedClient) {
        fetchClients()
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer la vente",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
        {/* Effets de fond */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-green-400/20 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-400/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative p-6 space-y-6">
          {/* Header */}
          <div className={`flex items-center gap-4 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 dark:from-white dark:via-green-200 dark:to-emerald-200 bg-clip-text text-transparent">
                Point de Vente
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Gérez vos ventes rapidement
              </p>
            </div>
            
            {/* Stats rapides */}
            <div className="ml-auto flex gap-3">
              <div className="px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 shadow-lg">
                <div className="text-xs text-gray-500">Panier</div>
                <div className="text-lg font-bold text-green-600">{cart.length} articles</div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 shadow-lg">
                <div className="text-xs text-gray-500">Total</div>
                <div className="text-lg font-bold text-indigo-600">{formatCurrency(total)}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Zone de recherche et produits */}
            <div className="lg:col-span-2 space-y-4">
              {/* Recherche */}
              <div className={`transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl" />
                  <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="🔍 Rechercher par nom, SKU ou code-barres..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-12 h-14 text-lg bg-white/50 dark:bg-gray-900/50 border-2 border-transparent focus:border-green-500 rounded-xl transition-all duration-300"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => { setSearchQuery(""); fetchProducts(); }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                          aria-label="Effacer la recherche"
                        >
                          <X className="h-5 w-5 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grille de produits */}
              <div className={`transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-500" />
                      Produits disponibles
                    </h2>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium">
                      {products.filter(p => p.quantity > 0).length} produits
                    </span>
                  </div>
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto">
                    {products
                      .filter((p) => p.quantity > 0)
                      .map((product, index) => (
                        <button
                          key={product.id}
                          onClick={() => addToCart(product)}
                          className="group relative rounded-xl bg-white dark:bg-gray-800 border-2 border-transparent hover:border-green-500 shadow-md hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 text-left overflow-hidden"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          {/* Effet de brillance au survol */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 z-10" />
                          
                          {/* Badge de stock */}
                          <div className={`absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            product.quantity <= 5 
                              ? "bg-red-100 text-red-600" 
                              : product.quantity <= 10 
                                ? "bg-orange-100 text-orange-600"
                                : "bg-green-100 text-green-600"
                          }`}>
                            {product.quantity}
                          </div>

                          {/* Image du produit */}
                          {product.imageUrl ? (
                            <div className="h-24 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            </div>
                          ) : (
                            <div className="h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                              <Package className="w-8 h-8 text-green-300 dark:text-green-600" />
                            </div>
                          )}
                          
                          <div className="relative p-3">
                            <div className="font-medium text-gray-800 dark:text-gray-200 line-clamp-2 text-sm mb-1 group-hover:text-green-600 transition-colors">
                              {product.name}
                            </div>
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(product.sellingPrice)}
                            </div>
                            <div className="text-xs text-gray-500">
                              par {product.unitLabel}
                            </div>
                          </div>
                          
                          {/* Bouton + au survol */}
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                            <div className="p-2 rounded-full bg-green-500 text-white shadow-lg">
                              <Plus className="w-4 h-4" />
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Panier */}
            <div className={`space-y-4 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}>
              {/* Carte du panier */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                {/* Header du panier */}
                <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Panier</h2>
                      <p className="text-green-100 text-sm">{cart.length} article(s)</p>
                    </div>
                    {cart.length > 0 && (
                      <button
                        onClick={() => setCart([])}
                        className="ml-auto p-2 hover:bg-white/20 rounded-lg transition-colors"
                        title="Vider le panier"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <ShoppingCart className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">Panier vide</p>
                      <p className="text-sm text-gray-400 mt-1">Cliquez sur un produit pour l'ajouter</p>
                    </div>
                  ) : (
                    <>
                      {/* Liste des articles */}
                      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                        {cart.map((item, index) => (
                          <div 
                            key={item.id} 
                            className="group p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 hover:border-green-300 transition-all duration-300"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="font-medium text-sm text-gray-800 dark:text-gray-200">{item.name}</div>
                                <div className="text-xs text-gray-500">
                                  {formatCurrency(item.unitPrice)} / {item.unitLabel}
                                </div>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                aria-label="Supprimer du panier"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                  className="p-1.5 rounded-lg bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 hover:border-green-500 hover:text-green-500 transition-colors"
                                  aria-label="Diminuer la quantité"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateCartQuantity(item.id, parseFloat(e.target.value) || 0)}
                                  className="h-8 w-14 text-center text-sm"
                                  min="0"
                                />
                                <button
                                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                  className="p-1.5 rounded-lg bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 hover:border-green-500 hover:text-green-500 transition-colors"
                                  aria-label="Augmenter la quantité"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <div className="font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(item.total)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Totaux */}
                      <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Sous-total</span>
                          <span className="font-medium">{formatCurrency(subtotal)}</span>
                        </div>
                        {totalDiscount > 0 && (
                          <div className="flex justify-between text-sm text-orange-600">
                            <span>Remises</span>
                            <span>-{formatCurrency(totalDiscount)}</span>
                          </div>
                        )}
                        
                        {/* Remise globale */}
                        <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Tag className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Remise globale</span>
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={discountType}
                              onChange={(e) => setDiscountType(e.target.value as "percent" | "amount")}
                              className="h-9 rounded-lg border border-orange-200 dark:border-orange-700 bg-white dark:bg-gray-800 px-2 text-sm"
                              aria-label="Type de remise"
                            >
                              <option value="percent">%</option>
                              <option value="amount">FCFA</option>
                            </select>
                            <Input
                              type="number"
                              value={discountValue}
                              onChange={(e) => setDiscountValue(e.target.value)}
                              placeholder="0"
                              className="flex-1 h-9"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200 dark:border-gray-600">
                          <span>Total</span>
                          <span className="text-green-600 dark:text-green-400">{formatCurrency(total)}</span>
                        </div>
                      </div>

                      {/* Méthode de paiement */}
                      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <BadgeDollarSign className="w-4 h-4 text-indigo-500" />
                          Méthode de paiement
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {paymentMethods.map((method) => {
                            const Icon = method.icon
                            const isSelected = paymentMethod === method.value
                            return (
                              <button
                                key={method.value}
                                onClick={() => {
                                  setPaymentMethod(method.value)
                                  if (method.value !== "CREDIT") {
                                    setSelectedClient(null)
                                    setClientSearch("")
                                    setDueDate("")
                                  }
                                }}
                                className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${
                                  isSelected 
                                    ? `border-transparent bg-gradient-to-r ${method.color} text-white shadow-lg` 
                                    : `border-gray-200 dark:border-gray-600 hover:border-gray-300 ${method.bgColor}`
                                }`}
                              >
                                <Icon className={`h-5 w-5 mx-auto mb-1 ${isSelected ? "text-white" : ""}`} />
                                <div className={`text-xs font-medium ${isSelected ? "text-white" : "text-gray-600 dark:text-gray-400"}`}>
                                  {method.label}
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className="absolute top-1 right-1 w-4 h-4 text-white" />
                                )}
                              </button>
                            )
                          })}
                        </div>

                        {/* Options de crédit */}
                        {paymentMethod === "CREDIT" && (
                          <div className="space-y-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-red-500" />
                              <Label className="text-sm font-medium text-red-700 dark:text-red-300">Client</Label>
                            </div>
                            <Input
                              value={clientSearch}
                              onChange={(e) => handleClientSearch(e.target.value)}
                              placeholder="Rechercher un client..."
                              className="bg-white dark:bg-gray-800"
                            />
                            {selectedClient && (
                              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2">
                                  <UserCheck className="w-4 h-4 text-green-500" />
                                  <span className="font-medium text-green-700 dark:text-green-300">{selectedClient.name}</span>
                                </div>
                                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  Solde: {formatCurrency(selectedClient.soldeActuel)} / Limite: {formatCurrency(selectedClient.limiteCredit)}
                                </div>
                                <button
                                  onClick={() => { setSelectedClient(null); setClientSearch(""); }}
                                  className="text-xs text-red-500 hover:underline mt-2"
                                >
                                  Changer de client
                                </button>
                              </div>
                            )}
                            {!selectedClient && (
                              <Input
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Ou saisir le nom du client"
                                className="bg-white dark:bg-gray-800"
                              />
                            )}
                            <div className="space-y-2">
                              <Label className="text-xs text-red-600 dark:text-red-400">Acompte (optionnel)</Label>
                              <Input
                                type="number"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                placeholder="Montant versé"
                                className="bg-white dark:bg-gray-800"
                              />
                              {remainingAmount > 0 && (
                                <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                  Reste à payer: {formatCurrency(remainingAmount)}
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Date d'échéance
                              </Label>
                              <Input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="bg-white dark:bg-gray-800"
                              />
                            </div>
                            {selectedClient && !canUseCredit && (
                              <div className="flex items-center gap-2 text-red-600 text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                Limite de crédit dépassée
                              </div>
                            )}
                          </div>
                        )}

                        {/* Montant payé (hors crédit) */}
                        {paymentMethod !== "CREDIT" && (
                          <div className="space-y-2">
                            <Label className="text-sm">Montant payé</Label>
                            <Input
                              type="number"
                              value={displayAmountPaid}
                              onChange={(e) => setAmountPaid(e.target.value)}
                              placeholder="0"
                              className="h-12 text-lg font-bold"
                            />
                            {change > 0 && (
                              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                <div className="text-sm text-blue-600 dark:text-blue-400">Monnaie à rendre</div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                  {formatCurrency(change)}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Bouton de validation */}
                        <Button
                          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02]"
                          onClick={handleCheckout}
                          disabled={loading || cart.length === 0}
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Traitement...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Receipt className="w-5 h-5" />
                              Finaliser la vente
                              <Sparkles className="w-4 h-4" />
                            </span>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogue de reçu */}
      <ReceiptDialog
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        sale={lastSale}
      />
    </MainLayout>
  )
}
