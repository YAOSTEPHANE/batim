"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { 
  MoreHorizontal, 
  Edit, 
  UserX, 
  UserCheck, 
  Shield, 
  Package, 
  ShoppingCart,
  Loader2,
  User,
  Mail,
  Calendar
} from "lucide-react"
import { UserDialog } from "./user-dialog"

interface UserData {
  id: string
  email: string
  name: string
  role: "ADMIN" | "STOCK_MANAGER" | "CASHIER"
  active: boolean
  createdAt: string
  _count: {
    sales: number
    stockMovements: number
  }
}

export function UsersList() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const toggleUserStatus = async (user: UserData) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: user.active ? "Utilisateur désactivé" : "Utilisateur réactivé",
        })
        fetchUsers()
      } else {
        throw new Error()
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      })
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        )
      case "STOCK_MANAGER":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0">
            <Package className="w-3 h-3 mr-1" />
            Stock
          </Badge>
        )
      case "CASHIER":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
            <ShoppingCart className="w-3 h-3 mr-1" />
            Caissier
          </Badge>
        )
      default:
        return <Badge>{role}</Badge>
    }
  }

  const handleEdit = (user: UserData) => {
    setSelectedUser(user)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedUser(null)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user, index) => (
          <div
            key={user.id}
            className={`
              relative group overflow-hidden rounded-2xl
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              shadow-lg hover:shadow-xl
              transform transition-all duration-300 hover:-translate-y-1
              ${!user.active ? 'opacity-60' : ''}
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Bande de couleur en haut */}
            <div className={`h-2 ${
              user.role === "ADMIN" 
                ? "bg-gradient-to-r from-purple-500 to-indigo-600" 
                : user.role === "STOCK_MANAGER"
                ? "bg-gradient-to-r from-blue-500 to-cyan-600"
                : "bg-gradient-to-r from-green-500 to-emerald-600"
            }`} />

            <div className="p-5">
              {/* En-tête avec avatar et actions */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg
                    ${user.role === "ADMIN" 
                      ? "bg-gradient-to-br from-purple-500 to-indigo-600" 
                      : user.role === "STOCK_MANAGER"
                      ? "bg-gradient-to-br from-blue-500 to-cyan-600"
                      : "bg-gradient-to-br from-green-500 to-emerald-600"
                    }
                  `}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </h3>
                    {getRoleBadge(user.role)}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleUserStatus(user)}>
                      {user.active ? (
                        <>
                          <UserX className="mr-2 h-4 w-4 text-red-500" />
                          Désactiver
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                          Réactiver
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Informations */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Créé le {format(new Date(user.createdAt), "dd MMM yyyy", { locale: fr })}
                  </span>
                </div>
              </div>

              {/* Statistiques */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <div className="text-center">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {user._count.sales}
                    </p>
                    <p className="text-gray-500 text-xs">Ventes</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {user._count.stockMovements}
                    </p>
                    <p className="text-gray-500 text-xs">Mouvements</p>
                  </div>
                  <div className="text-center">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${user.active 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                      {user.active ? "Actif" : "Inactif"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <UserDialog
        user={selectedUser}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchUsers}
      />
    </>
  )
}




