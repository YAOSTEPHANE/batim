"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { UsersList } from "@/components/users/users-list"
import { UserDialog } from "@/components/users/user-dialog"
import { Plus, Users, Shield } from "lucide-react"

export default function UsersPage() {
  const { data: session, status } = useSession()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  if (status === "loading") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </MainLayout>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
        {/* Effets de fond */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </div>

        <div className="relative p-6 lg:p-8 space-y-8">
          {/* En-tête */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">
                  Gestion des Utilisateurs
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Gérer les comptes et les permissions
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvel utilisateur
            </Button>
          </div>

          {/* Info box */}
          <div className="p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-indigo-100 dark:border-indigo-900">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white">Gestion des accès</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Créez des comptes pour votre équipe et attribuez-leur les rôles appropriés. 
                  Seuls les administrateurs peuvent accéder à cette page.
                </p>
              </div>
            </div>
          </div>

          {/* Liste des utilisateurs */}
          <UsersList key={refreshKey} />
        </div>
      </div>

      <UserDialog
        user={null}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </MainLayout>
  )
}
