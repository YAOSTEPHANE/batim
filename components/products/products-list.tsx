"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"
import { 
  Plus, 
  Search, 
  Package, 
  AlertTriangle, 
  Filter,
  Grid3X3,
  List,
  Tag,
  Barcode,
  TrendingUp,
  TrendingDown,
  Box,
  Sparkles,
  X,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ProductDialog } from "./product-dialog"

interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  sellingPrice: number
  purchasePrice: number
  quantity: number
  minThreshold: number
  unitLabel: string
  imageUrl?: string
  category: {
    name: string
  }
  brand?: {
    name: string
  }
}

export function ProductsList() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name")
  const [filterStock, setFilterStock] = useState<"all" | "low" | "out">("all")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/products")
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

  const filteredProducts = products
    .filter((p) => {
      // Filtre de recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matches = p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          (p.barcode && p.barcode.toLowerCase().includes(query))
        if (!matches) return false
      }
      // Filtre de stock
      if (filterStock === "low") return p.quantity <= p.minThreshold && p.quantity > 0
      if (filterStock === "out") return p.quantity === 0
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price": return b.sellingPrice - a.sellingPrice
        case "stock": return a.quantity - b.quantity
        default: return a.name.localeCompare(b.name)
      }
    })

  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.quantity <= p.minThreshold && p.quantity > 0).length,
    outOfStock: products.filter(p => p.quantity === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0)
  }

  const getStockStatus = (product: Product) => {
    if (product.quantity === 0) return { label: "Rupture", color: "bg-red-500", textColor: "text-red-500", bgLight: "bg-red-50 dark:bg-red-900/20" }
    if (product.quantity <= product.minThreshold) return { label: "Stock bas", color: "bg-orange-500", textColor: "text-orange-500", bgLight: "bg-orange-50 dark:bg-orange-900/20" }
    return { label: "En stock", color: "bg-green-500", textColor: "text-green-500", bgLight: "bg-green-50 dark:bg-green-900/20" }
  }

  const getMargin = (product: Product) => {
    const margin = ((product.sellingPrice - product.purchasePrice) / product.purchasePrice) * 100
    return margin.toFixed(0)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Package className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{stats.total}</div>
          <div className="text-purple-100 text-sm">Total produits</div>
        </div>
        
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <AlertTriangle className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{stats.lowStock}</div>
          <div className="text-orange-100 text-sm">Stock bas</div>
        </div>
        
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Box className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{stats.outOfStock}</div>
          <div className="text-red-100 text-sm">Ruptures</div>
        </div>
        
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
          <div className="text-emerald-100 text-sm">Valeur du stock</div>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className={`flex flex-wrap items-center gap-4 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        {/* Recherche */}
        <div className="relative flex-1 min-w-[300px]">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-xl" />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="🔍 Rechercher par nom, SKU ou code-barres..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-transparent focus:border-purple-500 rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); fetchProducts(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-1">
            {[
              { value: "all", label: "Tous", count: stats.total },
              { value: "low", label: "Stock bas", count: stats.lowStock, color: "text-orange-500" },
              { value: "out", label: "Rupture", count: stats.outOfStock, color: "text-red-500" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStock(filter.value as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  filterStock === filter.value
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : `text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 ${filter.color || ""}`
                }`}
              >
                {filter.label}
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  filterStock === filter.value ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tri */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="h-12 px-4 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-sm"
        >
          <option value="name">Trier par nom</option>
          <option value="price">Trier par prix</option>
          <option value="stock">Trier par stock</option>
        </select>

        {/* Vue */}
        <div className="flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all duration-300 ${
              viewMode === "grid" ? "bg-purple-500 text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Grid3X3 className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all duration-300 ${
              viewMode === "list" ? "bg-purple-500 text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>

        {/* Bouton nouveau produit */}
        <Button 
          onClick={() => {
            setSelectedProduct(null)
            setDialogOpen(true)
          }}
          className="h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nouveau produit
          <Sparkles className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Liste des produits */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Chargement des produits...</p>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {filteredProducts.map((product, index) => {
            const stockStatus = getStockStatus(product)
            const margin = getMargin(product)
            return (
              <div
                key={product.id}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 overflow-hidden cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => {
                  setSelectedProduct(product)
                  setDialogOpen(true)
                }}
              >
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {/* Badge de statut */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white ${stockStatus.color}`}>
                  {stockStatus.label}
                </div>

                {/* Image du produit */}
                {product.imageUrl ? (
                  <div className="h-40 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
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
                  <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                    <Package className="w-12 h-12 text-purple-300 dark:text-purple-600" />
                  </div>
                )}

                {/* Contenu */}
                <div className="p-5">
                  {/* En-tête */}
                  <div className="mb-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${stockStatus.bgLight}`}>
                        <Package className={`w-5 h-5 ${stockStatus.textColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {product.category.name}
                          {product.brand && <span className="text-purple-500"> • {product.brand.name}</span>}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Infos */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">SKU:</span>
                      <span className="font-mono text-gray-700 dark:text-gray-300">{product.sku}</span>
                    </div>
                    
                    {product.barcode && (
                      <div className="flex items-center gap-2 text-sm">
                        <Barcode className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Code:</span>
                        <span className="font-mono text-gray-700 dark:text-gray-300">{product.barcode}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div>
                        <div className="text-xs text-gray-500">Stock</div>
                        <div className={`text-lg font-bold ${stockStatus.textColor}`}>
                          {product.quantity} <span className="text-sm font-normal text-gray-500">{product.unitLabel}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Prix de vente</div>
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {formatCurrency(product.sellingPrice)}
                        </div>
                      </div>
                    </div>

                    {/* Marge */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <span className="text-xs text-gray-500">Marge</span>
                      <div className="flex items-center gap-1">
                        {parseInt(margin) > 20 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-orange-500" />
                        )}
                        <span className={`font-bold ${parseInt(margin) > 20 ? "text-green-500" : "text-orange-500"}`}>
                          {margin}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions au survol */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white dark:from-gray-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 hover:bg-purple-200 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Vue liste */
        <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg overflow-hidden transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Produit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Catégorie</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Stock</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Prix achat</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Prix vente</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Marge</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredProducts.map((product, index) => {
                const stockStatus = getStockStatus(product)
                const margin = getMargin(product)
                return (
                  <tr 
                    key={product.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedProduct(product)
                      setDialogOpen(true)
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${stockStatus.bgLight}`}>
                          <Package className={`w-5 h-5 ${stockStatus.textColor}`} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200">{product.name}</div>
                          {product.brand && <div className="text-xs text-purple-500">{product.brand.name}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-600 dark:text-gray-400">{product.sku}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{product.category.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${stockStatus.bgLight} ${stockStatus.textColor}`}>
                        {product.quantity} {product.unitLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(product.purchasePrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(product.sellingPrice)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 ${parseInt(margin) > 20 ? "text-green-500" : "text-orange-500"}`}>
                        {parseInt(margin) > 20 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {margin}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-500 mb-6">Essayez de modifier vos filtres ou ajoutez un nouveau produit</p>
          <Button 
            onClick={() => {
              setSelectedProduct(null)
              setDialogOpen(true)
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un produit
          </Button>
        </div>
      )}

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        onSuccess={fetchProducts}
      />
    </div>
  )
}
