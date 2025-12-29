"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Mail,
  MapPin,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  UserX,
  Scale,
  Sparkles,
  History,
  Wallet,
  X,
  MoreVertical,
  Eye,
  Edit,
  Star,
  Crown
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ClientDialog } from "./client-dialog"
import Link from "next/link"

interface Client {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  photoUrl?: string
  limiteCredit: number
  soldeActuel: number
  status: "ACTIVE" | "BLOCKED" | "LITIGATION"
}

export function ClientsList() {
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | "ACTIVE" | "BLOCKED" | "LITIGATION">("all")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/clients")
      const data = await res.json()
      setClients(data)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter((c) => {
    // Filtre par statut
    if (filterStatus !== "all" && c.status !== filterStatus) return false
    
    // Filtre par recherche
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      c.name.toLowerCase().includes(query) ||
      c.phone.includes(query) ||
      (c.email && c.email.toLowerCase().includes(query))
    )
  })

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === "ACTIVE").length,
    blocked: clients.filter(c => c.status === "BLOCKED").length,
    litigation: clients.filter(c => c.status === "LITIGATION").length,
    totalDebt: clients.reduce((sum, c) => sum + c.soldeActuel, 0),
    totalCredit: clients.reduce((sum, c) => sum + c.limiteCredit, 0)
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { 
          label: "Actif", 
          icon: CheckCircle, 
          color: "text-green-500", 
          bgColor: "bg-green-500",
          bgLight: "bg-green-50 dark:bg-green-900/20",
          gradient: "from-green-500 to-emerald-500"
        }
      case "BLOCKED":
        return { 
          label: "Bloqué", 
          icon: XCircle, 
          color: "text-red-500", 
          bgColor: "bg-red-500",
          bgLight: "bg-red-50 dark:bg-red-900/20",
          gradient: "from-red-500 to-rose-500"
        }
      case "LITIGATION":
        return { 
          label: "Contentieux", 
          icon: Scale, 
          color: "text-orange-500", 
          bgColor: "bg-orange-500",
          bgLight: "bg-orange-50 dark:bg-orange-900/20",
          gradient: "from-orange-500 to-amber-500"
        }
      default:
        return { 
          label: "Inconnu", 
          icon: User, 
          color: "text-gray-500", 
          bgColor: "bg-gray-500",
          bgLight: "bg-gray-50 dark:bg-gray-900/20",
          gradient: "from-gray-500 to-slate-500"
        }
    }
  }

  const getCreditTier = (client: Client) => {
    if (client.limiteCredit >= 1000000) return { tier: "Platine", icon: Crown, color: "text-purple-500" }
    if (client.limiteCredit >= 500000) return { tier: "Or", icon: Star, color: "text-yellow-500" }
    if (client.limiteCredit >= 100000) return { tier: "Argent", icon: Star, color: "text-gray-400" }
    return { tier: "Bronze", icon: Star, color: "text-orange-700" }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Users className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{stats.total}</div>
          <div className="text-orange-100 text-sm">Total clients</div>
        </div>
        
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <UserCheck className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{stats.active}</div>
          <div className="text-green-100 text-sm">Clients actifs</div>
        </div>
        
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CreditCard className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">{formatCurrency(stats.totalDebt)}</div>
          <div className="text-red-100 text-sm">Total créances</div>
        </div>
        
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Wallet className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-2xl font-bold">{formatCurrency(stats.totalCredit)}</div>
          <div className="text-indigo-100 text-sm">Crédit total accordé</div>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className={`flex flex-wrap items-center gap-4 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        {/* Recherche */}
        <div className="relative flex-1 min-w-[300px]">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl blur-xl" />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="🔍 Rechercher par nom, téléphone ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-transparent focus:border-orange-500 rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Filtres par statut */}
        <div className="flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-1">
          {[
            { value: "all", label: "Tous", count: stats.total, icon: Users },
            { value: "ACTIVE", label: "Actifs", count: stats.active, icon: UserCheck, color: "text-green-500" },
            { value: "BLOCKED", label: "Bloqués", count: stats.blocked, icon: UserX, color: "text-red-500" },
            { value: "LITIGATION", label: "Contentieux", count: stats.litigation, icon: Scale, color: "text-orange-500" },
          ].map((filter) => {
            const Icon = filter.icon
            return (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  filterStatus === filter.value
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg"
                    : `text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 ${filter.color || ""}`
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{filter.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  filterStatus === filter.value ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"
                }`}>
                  {filter.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Bouton nouveau client */}
        <Button 
          onClick={() => {
            setSelectedClient(null)
            setDialogOpen(true)
          }}
          className="h-12 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nouveau client
          <Sparkles className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Liste des clients */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Chargement des clients...</p>
          </div>
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {filteredClients.map((client, index) => {
            const statusInfo = getStatusInfo(client.status)
            const StatusIcon = statusInfo.icon
            const creditTier = getCreditTier(client)
            const TierIcon = creditTier.icon
            const creditUsage = client.limiteCredit > 0 
              ? (client.soldeActuel / client.limiteCredit) * 100 
              : 0
            const isOverLimit = client.soldeActuel > client.limiteCredit && client.limiteCredit > 0

            return (
              <div
                key={client.id}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 overflow-hidden cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => {
                  setSelectedClient(client)
                  setDialogOpen(true)
                }}
              >
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {/* Badge de statut */}
                <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white ${statusInfo.bgColor}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusInfo.label}
                </div>

                {/* Contenu */}
                <div className="p-5">
                  {/* En-tête avec avatar */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      {client.photoUrl ? (
                        <img
                          src={client.photoUrl}
                          alt={client.name}
                          className="w-16 h-16 rounded-xl object-cover shadow-lg"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${statusInfo.gradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {/* Badge tier */}
                      <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-gray-800 shadow-lg ${creditTier.color}`}>
                        <TierIcon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 truncate group-hover:text-orange-500 transition-colors">
                        {client.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </div>
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 truncate">
                          <Mail className="w-4 h-4" />
                          {client.email}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Adresse */}
                  {client.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-500 mb-4 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{client.address}</span>
                    </div>
                  )}

                  {/* Informations crédit */}
                  <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Wallet className="w-4 h-4" />
                        Limite crédit
                      </div>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(client.limiteCredit)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CreditCard className="w-4 h-4" />
                        Solde actuel
                      </div>
                      <span className={`font-bold ${isOverLimit ? "text-red-500" : client.soldeActuel > 0 ? "text-orange-500" : "text-green-500"}`}>
                        {formatCurrency(client.soldeActuel)}
                      </span>
                    </div>

                    {/* Barre de progression */}
                    {client.limiteCredit > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Utilisation du crédit</span>
                          <span className={isOverLimit ? "text-red-500 font-bold" : ""}>
                            {creditUsage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                              isOverLimit
                                ? "bg-gradient-to-r from-red-500 to-rose-500"
                                : creditUsage > 80
                                  ? "bg-gradient-to-r from-orange-500 to-amber-500"
                                  : "bg-gradient-to-r from-green-500 to-emerald-500"
                            }`}
                            style={{ width: `${Math.min(creditUsage, 100)}%` }}
                          />
                        </div>
                        {isOverLimit && (
                          <div className="flex items-center gap-1 text-xs text-red-500">
                            <AlertTriangle className="w-3 h-3" />
                            Limite dépassée !
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link
                      href={`/clients/${client.id}/payments`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full group/btn hover:bg-green-50 hover:border-green-500 hover:text-green-600 transition-all duration-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Wallet className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                        Versements
                      </Button>
                    </Link>
                    <Link
                      href={`/clients/${client.id}/history`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full group/btn hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <History className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                        Historique
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Actions au survol */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex gap-1">
                    <button 
                      className="p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-lg hover:bg-orange-50 hover:text-orange-500 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedClient(client)
                        setDialogOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {filteredClients.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Aucun client trouvé</h3>
          <p className="text-gray-500 mb-6">Essayez de modifier vos filtres ou ajoutez un nouveau client</p>
          <Button 
            onClick={() => {
              setSelectedClient(null)
              setDialogOpen(true)
            }}
            className="bg-gradient-to-r from-orange-500 to-amber-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un client
          </Button>
        </div>
      )}

      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={selectedClient}
        onSuccess={fetchClients}
      />
    </div>
  )
}
