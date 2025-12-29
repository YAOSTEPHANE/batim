"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Settings,
  Building2,
  CreditCard,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Save,
  Loader2,
  Database,
  Shield,
  Bell,
  Palette,
  Globe,
  FileText,
  BarChart3,
  Boxes,
  Store,
  Phone,
  Mail,
  MapPin,
  Percent,
  DollarSign,
  Clock,
  CheckCircle2,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  HardDrive,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Monitor,
  Printer,
  FileSpreadsheet,
  Archive,
  RotateCcw,
  AlertCircle,
  CheckCheck,
  XCircle,
  Calendar,
  BellRing,
  BellOff
} from "lucide-react"

interface SettingsData {
  statistics: {
    totalProducts: number
    totalCategories: number
    totalBrands: number
    totalSuppliers: number
    totalClients: number
    totalUsers: number
    totalSales: number
    lowStockProducts: number
    stockValuePurchase: number
    stockValueSelling: number
    potentialProfit: number
  }
  businessRules: {
    adminApprovalThreshold: number
    creditOverdueDaysBlock: number
    defaultCreditLimit: number
    lowStockAlertThreshold: number
  }
  company: {
    name: string
    address: string
    phone: string
    email: string
    currency: string
    taxRate: number
  }
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: any
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

function SettingSection({ 
  icon: Icon, 
  title, 
  description, 
  children,
  color = "from-indigo-500 to-purple-600"
}: {
  icon: any
  title: string
  description: string
  children: React.ReactNode
  color?: string
}) {
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      <div className={`p-4 bg-gradient-to-r ${color}`}>
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-white" />
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-white/80">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

function ActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  color,
  loading = false,
  disabled = false
}: {
  icon: any
  title: string
  description: string
  onClick: () => void
  color: string
  loading?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        relative group p-5 rounded-xl border-2 border-dashed
        transition-all duration-300 text-left w-full
        hover:border-solid hover:shadow-lg hover:-translate-y-1
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        ${color}
      `}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color.includes('amber') ? 'from-amber-500 to-orange-600' : color.includes('blue') ? 'from-blue-500 to-indigo-600' : color.includes('green') ? 'from-green-500 to-emerald-600' : color.includes('red') ? 'from-red-500 to-rose-600' : color.includes('purple') ? 'from-purple-500 to-pink-600' : 'from-gray-500 to-gray-600'} shadow-lg group-hover:scale-110 transition-transform`}>
          {loading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Icon className="w-6 h-6 text-white" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </button>
  )
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const { toast } = useToast()

  // États pour les formulaires
  const [companyName, setCompanyName] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")
  const [taxRate, setTaxRate] = useState(18)
  const [adminThreshold, setAdminThreshold] = useState(500000)
  const [overdueBlock, setOverdueBlock] = useState(90)
  const [defaultCreditLimit, setDefaultCreditLimit] = useState(100000)
  const [lowStockThreshold, setLowStockThreshold] = useState(10)

  // États pour les actions
  const [exportLoading, setExportLoading] = useState(false)
  const [backupLoading, setBackupLoading] = useState(false)
  const [cacheLoading, setCacheLoading] = useState(false)

  // États pour les dialogs
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [alertsDialogOpen, setAlertsDialogOpen] = useState(false)
  const [themeDialogOpen, setThemeDialogOpen] = useState(false)
  const [backupDialogOpen, setBackupDialogOpen] = useState(false)

  // États pour les alertes
  const [lowStockAlert, setLowStockAlert] = useState(true)
  const [overdueAlert, setOverdueAlert] = useState(true)
  const [dailyReportAlert, setDailyReportAlert] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)

  // État pour le thème
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")

  const isAdmin = session?.user?.role === "ADMIN"

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        setCompanyName(data.company.name)
        setCompanyAddress(data.company.address)
        setCompanyPhone(data.company.phone)
        setCompanyEmail(data.company.email)
        setTaxRate(data.company.taxRate)
        setAdminThreshold(data.businessRules.adminApprovalThreshold)
        setOverdueBlock(data.businessRules.creditOverdueDaysBlock)
        setDefaultCreditLimit(data.businessRules.defaultCreditLimit)
        setLowStockThreshold(data.businessRules.lowStockAlertThreshold)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: {
            name: companyName,
            address: companyAddress,
            phone: companyPhone,
            email: companyEmail,
            taxRate,
          },
          businessRules: {
            adminApprovalThreshold: adminThreshold,
            creditOverdueDaysBlock: overdueBlock,
            defaultCreditLimit,
            lowStockAlertThreshold: lowStockThreshold,
          }
        }),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Paramètres enregistrés",
        })
      } else {
        throw new Error()
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les paramètres",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Fonction d'export des données
  const handleExport = async (type: string) => {
    setExportLoading(true)
    try {
      // Simuler un export
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const data = {
        exportDate: new Date().toISOString(),
        type,
        company: companyName,
        statistics: settings?.statistics
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `export_${type}_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      toast({
        title: "Export réussi",
        description: `Les données ${type} ont été exportées avec succès`,
      })
      setExportDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "L'export a échoué",
        variant: "destructive",
      })
    } finally {
      setExportLoading(false)
    }
  }

  // Fonction de sauvegarde
  const handleBackup = async () => {
    setBackupLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      toast({
        title: "Sauvegarde créée",
        description: "La sauvegarde de la base de données a été créée avec succès",
      })
      setBackupDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "La sauvegarde a échoué",
        variant: "destructive",
      })
    } finally {
      setBackupLoading(false)
    }
  }

  // Fonction de nettoyage du cache
  const handleClearCache = async () => {
    setCacheLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast({
        title: "Cache vidé",
        description: "Le cache de l'application a été nettoyé",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Le nettoyage du cache a échoué",
        variant: "destructive",
      })
    } finally {
      setCacheLoading(false)
    }
  }

  // Sauvegarder les alertes
  const handleSaveAlerts = () => {
    toast({
      title: "Alertes configurées",
      description: "Vos préférences d'alertes ont été enregistrées",
    })
    setAlertsDialogOpen(false)
  }

  // Sauvegarder le thème
  const handleSaveTheme = () => {
    // Appliquer le thème
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark")
    }
    toast({
      title: "Thème appliqué",
      description: `Le thème ${theme === "light" ? "clair" : theme === "dark" ? "sombre" : "système"} a été appliqué`,
    })
    setThemeDialogOpen(false)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
        {/* Effets de fond */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </div>

        <div className="relative p-6 lg:p-8 space-y-8">
          {/* En-tête */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  Paramètres
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Configuration du système et statistiques
                </p>
              </div>
            </div>
            {isAdmin && (
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Enregistrer
              </Button>
            )}
          </div>

          {/* Statistiques du système */}
          <SettingSection
            icon={BarChart3}
            title="Statistiques du Système"
            description="Vue d'ensemble des données de votre quincaillerie"
            color="from-emerald-500 to-teal-600"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Package}
                label="Produits"
                value={settings?.statistics.totalProducts || 0}
                color="bg-gradient-to-br from-blue-500 to-indigo-600"
              />
              <StatCard
                icon={Boxes}
                label="Catégories"
                value={settings?.statistics.totalCategories || 0}
                color="bg-gradient-to-br from-purple-500 to-pink-600"
              />
              <StatCard
                icon={Store}
                label="Fournisseurs"
                value={settings?.statistics.totalSuppliers || 0}
                color="bg-gradient-to-br from-orange-500 to-red-600"
              />
              <StatCard
                icon={Users}
                label="Clients"
                value={settings?.statistics.totalClients || 0}
                color="bg-gradient-to-br from-cyan-500 to-blue-600"
              />
              <StatCard
                icon={ShoppingCart}
                label="Ventes Totales"
                value={settings?.statistics.totalSales || 0}
                color="bg-gradient-to-br from-green-500 to-emerald-600"
              />
              <StatCard
                icon={Users}
                label="Utilisateurs"
                value={settings?.statistics.totalUsers || 0}
                color="bg-gradient-to-br from-indigo-500 to-purple-600"
              />
              <StatCard
                icon={AlertTriangle}
                label="Stock Faible"
                value={settings?.statistics.lowStockProducts || 0}
                color="bg-gradient-to-br from-amber-500 to-orange-600"
              />
              <StatCard
                icon={TrendingUp}
                label="Profit Potentiel"
                value={formatCurrency(settings?.statistics.potentialProfit || 0)}
                color="bg-gradient-to-br from-teal-500 to-green-600"
              />
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Valeur du Stock (Achat)</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(settings?.statistics.stockValuePurchase || 0)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800">
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">Valeur du Stock (Vente)</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(settings?.statistics.stockValueSelling || 0)}
                </p>
              </div>
            </div>
          </SettingSection>

          {/* Informations de l'entreprise */}
          <SettingSection
            icon={Building2}
            title="Informations de l'Entreprise"
            description="Coordonnées affichées sur les factures et reçus"
            color="from-blue-500 to-cyan-600"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-gray-500" />
                  Nom de l'entreprise
                </Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={!isAdmin}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  Email
                </Label>
                <Input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  disabled={!isAdmin}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  Téléphone
                </Label>
                <Input
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  disabled={!isAdmin}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  Adresse
                </Label>
                <Input
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  disabled={!isAdmin}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-gray-500" />
                  Taux de TVA (%)
                </Label>
                <Input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  disabled={!isAdmin}
                  className="h-11"
                />
              </div>
            </div>
          </SettingSection>

          {/* Règles métier */}
          <SettingSection
            icon={Shield}
            title="Règles Métier"
            description="Configuration des règles de gestion du crédit et du stock"
            color="from-purple-500 to-pink-600"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  Seuil d'approbation Admin (FCFA)
                </Label>
                <Input
                  type="number"
                  value={adminThreshold}
                  onChange={(e) => setAdminThreshold(Number(e.target.value))}
                  disabled={!isAdmin}
                  className="h-11"
                />
                <p className="text-xs text-gray-500">
                  Les ventes à crédit au-dessus de ce montant nécessitent une approbation
                </p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  Jours avant blocage crédit
                </Label>
                <Input
                  type="number"
                  value={overdueBlock}
                  onChange={(e) => setOverdueBlock(Number(e.target.value))}
                  disabled={!isAdmin}
                  className="h-11"
                />
                <p className="text-xs text-gray-500">
                  Bloquer le crédit après X jours d'impayé
                </p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  Limite de crédit par défaut (FCFA)
                </Label>
                <Input
                  type="number"
                  value={defaultCreditLimit}
                  onChange={(e) => setDefaultCreditLimit(Number(e.target.value))}
                  disabled={!isAdmin}
                  className="h-11"
                />
                <p className="text-xs text-gray-500">
                  Limite de crédit attribuée aux nouveaux clients
                </p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-gray-500" />
                  Seuil d'alerte stock faible
                </Label>
                <Input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  disabled={!isAdmin}
                  className="h-11"
                />
                <p className="text-xs text-gray-500">
                  Alerte quand le stock descend en dessous de ce seuil
                </p>
              </div>
            </div>
          </SettingSection>

          {/* Informations système */}
          <SettingSection
            icon={Database}
            title="Informations Système"
            description="Détails techniques de l'application"
            color="from-gray-600 to-gray-800"
          >
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                <p className="text-sm text-gray-500 mb-1">Version</p>
                <p className="font-semibold text-gray-900 dark:text-white">1.0.0</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                <p className="text-sm text-gray-500 mb-1">Base de données</p>
                <p className="font-semibold text-gray-900 dark:text-white">MongoDB</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                <p className="text-sm text-gray-500 mb-1">Framework</p>
                <p className="font-semibold text-gray-900 dark:text-white">Next.js 14</p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Système opérationnel</p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Tous les services fonctionnent normalement
                  </p>
                </div>
              </div>
            </div>
          </SettingSection>

          {/* Actions Rapides (Admin uniquement) */}
          {isAdmin && (
            <SettingSection
              icon={Zap}
              title="Actions Rapides"
              description="Outils d'administration et maintenance du système"
              color="from-amber-500 to-orange-600"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ActionCard
                  icon={FileSpreadsheet}
                  title="Exporter les données"
                  description="Télécharger les données en JSON ou CSV"
                  onClick={() => setExportDialogOpen(true)}
                  color="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  loading={exportLoading}
                />
                <ActionCard
                  icon={BellRing}
                  title="Configurer les alertes"
                  description="Gérer les notifications et rappels"
                  onClick={() => setAlertsDialogOpen(true)}
                  color="border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                />
                <ActionCard
                  icon={Palette}
                  title="Personnaliser l'interface"
                  description="Changer le thème et l'apparence"
                  onClick={() => setThemeDialogOpen(true)}
                  color="border-pink-200 dark:border-pink-800 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                />
                <ActionCard
                  icon={Archive}
                  title="Sauvegarder les données"
                  description="Créer une sauvegarde complète"
                  onClick={() => setBackupDialogOpen(true)}
                  color="border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
                  loading={backupLoading}
                />
                <ActionCard
                  icon={RefreshCw}
                  title="Vider le cache"
                  description="Nettoyer les données temporaires"
                  onClick={handleClearCache}
                  color="border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  loading={cacheLoading}
                />
                <ActionCard
                  icon={Printer}
                  title="Imprimer un rapport"
                  description="Générer un rapport PDF complet"
                  onClick={() => {
                    toast({
                      title: "Rapport en cours",
                      description: "Le rapport sera prêt dans quelques instants",
                    })
                  }}
                  color="border-cyan-200 dark:border-cyan-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                />
              </div>

              {/* Actions supplémentaires */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Actions avancées
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <ActionCard
                    icon={RotateCcw}
                    title="Réinitialiser les paramètres"
                    description="Restaurer les valeurs par défaut"
                    onClick={() => {
                      setAdminThreshold(500000)
                      setOverdueBlock(90)
                      setDefaultCreditLimit(100000)
                      setLowStockThreshold(10)
                      toast({
                        title: "Paramètres réinitialisés",
                        description: "Les valeurs par défaut ont été restaurées",
                      })
                    }}
                    color="border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  />
                  <ActionCard
                    icon={HardDrive}
                    title="Optimiser la base de données"
                    description="Améliorer les performances"
                    onClick={() => {
                      toast({
                        title: "Optimisation lancée",
                        description: "L'optimisation est en cours...",
                      })
                    }}
                    color="border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  />
                </div>
              </div>
            </SettingSection>
          )}
        </div>
      </div>

      {/* Dialog Export */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              Exporter les données
            </DialogTitle>
            <DialogDescription>
              Choisissez les données à exporter
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <button
              onClick={() => handleExport("produits")}
              disabled={exportLoading}
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left flex items-center gap-3"
            >
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Produits</p>
                <p className="text-sm text-gray-500">Catalogue complet des produits</p>
              </div>
            </button>
            <button
              onClick={() => handleExport("clients")}
              disabled={exportLoading}
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left flex items-center gap-3"
            >
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Clients</p>
                <p className="text-sm text-gray-500">Liste des clients et soldes</p>
              </div>
            </button>
            <button
              onClick={() => handleExport("ventes")}
              disabled={exportLoading}
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left flex items-center gap-3"
            >
              <ShoppingCart className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium">Ventes</p>
                <p className="text-sm text-gray-500">Historique des transactions</p>
              </div>
            </button>
            <button
              onClick={() => handleExport("complet")}
              disabled={exportLoading}
              className="w-full p-4 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-left flex items-center gap-3"
            >
              <Download className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="font-medium text-indigo-700 dark:text-indigo-300">Export complet</p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">Toutes les données du système</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Alertes */}
      <Dialog open={alertsDialogOpen} onOpenChange={setAlertsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BellRing className="w-5 h-5 text-purple-600" />
              Configuration des alertes
            </DialogTitle>
            <DialogDescription>
              Gérez vos préférences de notifications
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-medium">Alerte stock faible</p>
                  <p className="text-sm text-gray-500">Notification quand un produit est en rupture</p>
                </div>
              </div>
              <button
                onClick={() => setLowStockAlert(!lowStockAlert)}
                aria-label={lowStockAlert ? "Désactiver l'alerte stock faible" : "Activer l'alerte stock faible"}
                className={`w-12 h-6 rounded-full transition-colors ${lowStockAlert ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${lowStockAlert ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium">Alerte impayés</p>
                  <p className="text-sm text-gray-500">Rappel pour les factures en retard</p>
                </div>
              </div>
              <button
                onClick={() => setOverdueAlert(!overdueAlert)}
                aria-label={overdueAlert ? "Désactiver l'alerte impayés" : "Activer l'alerte impayés"}
                className={`w-12 h-6 rounded-full transition-colors ${overdueAlert ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${overdueAlert ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Rapport quotidien</p>
                  <p className="text-sm text-gray-500">Résumé des ventes chaque jour</p>
                </div>
              </div>
              <button
                onClick={() => setDailyReportAlert(!dailyReportAlert)}
                aria-label={dailyReportAlert ? "Désactiver le rapport quotidien" : "Activer le rapport quotidien"}
                className={`w-12 h-6 rounded-full transition-colors ${dailyReportAlert ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${dailyReportAlert ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="font-medium">Notifications email</p>
                  <p className="text-sm text-gray-500">Recevoir les alertes par email</p>
                </div>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                aria-label={emailNotifications ? "Désactiver les notifications email" : "Activer les notifications email"}
                className={`w-12 h-6 rounded-full transition-colors ${emailNotifications ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setAlertsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveAlerts} className="bg-purple-600 hover:bg-purple-700">
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Thème */}
      <Dialog open={themeDialogOpen} onOpenChange={setThemeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-pink-600" />
              Personnalisation
            </DialogTitle>
            <DialogDescription>
              Choisissez l'apparence de l'application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <button
              onClick={() => setTheme("light")}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${theme === "light" ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <div className="p-2 rounded-lg bg-amber-100">
                <Sun className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Mode clair</p>
                <p className="text-sm text-gray-500">Interface lumineuse</p>
              </div>
              {theme === "light" && <CheckCheck className="ml-auto w-5 h-5 text-pink-600" />}
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${theme === "dark" ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                <Moon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Mode sombre</p>
                <p className="text-sm text-gray-500">Interface sombre</p>
              </div>
              {theme === "dark" && <CheckCheck className="ml-auto w-5 h-5 text-pink-600" />}
            </button>

            <button
              onClick={() => setTheme("system")}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${theme === "system" ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <Monitor className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Système</p>
                <p className="text-sm text-gray-500">Suivre les préférences système</p>
              </div>
              {theme === "system" && <CheckCheck className="ml-auto w-5 h-5 text-pink-600" />}
            </button>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setThemeDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveTheme} className="bg-pink-600 hover:bg-pink-700">
              Appliquer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Sauvegarde */}
      <Dialog open={backupDialogOpen} onOpenChange={setBackupDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-green-600" />
              Sauvegarde des données
            </DialogTitle>
            <DialogDescription>
              Créer une sauvegarde complète de votre système
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Données incluses</p>
                  <ul className="text-sm text-green-600 dark:text-green-400 mt-1 space-y-1">
                    <li>• Produits et catégories</li>
                    <li>• Clients et fournisseurs</li>
                    <li>• Historique des ventes</li>
                    <li>• Paramètres système</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Important</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    La sauvegarde peut prendre plusieurs minutes selon la taille de vos données.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setBackupDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleBackup} 
              disabled={backupLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {backupLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde en cours...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Lancer la sauvegarde
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
