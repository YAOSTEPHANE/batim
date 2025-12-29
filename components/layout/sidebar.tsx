"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  LogOut,
  Truck,
  BarChart3,
  CreditCard,
  Clock,
  Wrench,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const menuItems = [
  {
    title: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "STOCK_MANAGER", "CASHIER"],
    gradient: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-500",
  },
  {
    title: "Point de Vente",
    href: "/pos",
    icon: ShoppingCart,
    roles: ["ADMIN", "CASHIER"],
    gradient: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    textColor: "text-green-500",
  },
  {
    title: "Produits",
    href: "/products",
    icon: Package,
    roles: ["ADMIN", "STOCK_MANAGER"],
    gradient: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-500",
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
    roles: ["ADMIN", "STOCK_MANAGER"],
    gradient: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-500",
  },
  {
    title: "Fournisseurs",
    href: "/suppliers",
    icon: Truck,
    roles: ["ADMIN", "STOCK_MANAGER"],
    gradient: "from-indigo-500 to-violet-500",
    bgColor: "bg-indigo-500/10",
    textColor: "text-indigo-500",
  },
  {
    title: "Achats",
    href: "/purchases",
    icon: FileText,
    roles: ["ADMIN", "STOCK_MANAGER"],
    gradient: "from-teal-500 to-cyan-500",
    bgColor: "bg-teal-500/10",
    textColor: "text-teal-500",
  },
  {
    title: "Rapports",
    href: "/reports",
    icon: BarChart3,
    roles: ["ADMIN", "STOCK_MANAGER"],
    gradient: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-500/10",
    textColor: "text-rose-500",
  },
  {
    title: "Impayés",
    href: "/unpaid",
    icon: CreditCard,
    roles: ["ADMIN", "STOCK_MANAGER"],
    gradient: "from-red-500 to-orange-500",
    bgColor: "bg-red-500/10",
    textColor: "text-red-500",
  },
  {
    title: "En Attente",
    href: "/sales/pending",
    icon: Clock,
    roles: ["ADMIN"],
    gradient: "from-yellow-500 to-amber-500",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-500",
  },
  {
    title: "Utilisateurs",
    href: "/users",
    icon: UserCircle,
    roles: ["ADMIN"],
    gradient: "from-sky-500 to-blue-500",
    bgColor: "bg-sky-500/10",
    textColor: "text-sky-500",
  },
  {
    title: "Paramètres",
    href: "/settings",
    icon: Settings,
    roles: ["ADMIN"],
    gradient: "from-slate-500 to-gray-500",
    bgColor: "bg-slate-500/10",
    textColor: "text-slate-500",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  )

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return { label: "Admin", color: "bg-gradient-to-r from-purple-500 to-pink-500" }
      case "STOCK_MANAGER":
        return { label: "Stock", color: "bg-gradient-to-r from-blue-500 to-cyan-500" }
      case "CASHIER":
        return { label: "Caissier", color: "bg-gradient-to-r from-green-500 to-emerald-500" }
      default:
        return { label: "User", color: "bg-gray-500" }
    }
  }

  const roleBadge = getRoleBadge(userRole)

  return (
    <div 
      className={cn(
        "flex h-screen flex-col border-r bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 transition-all duration-300 relative",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Effets de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-500/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-500/10 to-transparent" />
      </div>

      {/* Bouton de collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-50 p-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Header */}
      <div className={cn(
        "relative flex items-center border-b border-white/10 px-4",
        collapsed ? "h-20 justify-center" : "h-20"
      )}>
        <div className={cn(
          "flex items-center gap-3 transition-all duration-300",
          collapsed && "justify-center"
        )}>
          {/* Logo animé */}
          <div 
            className="relative p-2 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 shadow-lg shadow-purple-500/30"
            style={{
              animation: mounted ? "logoFloat 3s ease-in-out infinite" : "none"
            }}
          >
            <Wrench className="h-6 w-6 text-white" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-pulse" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Quincaillerie
              </h1>
              <p className="text-[10px] text-slate-400">Gestion Intelligente</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 space-y-1 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {filteredMenuItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                collapsed ? "justify-center" : "",
                isActive
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Effet de lueur au survol */}
              {!isActive && (
                <div className={cn(
                  "absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                  item.gradient
                )} />
              )}
              
              {/* Indicateur actif */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg shadow-white/50" />
              )}
              
              <div className={cn(
                "relative p-1.5 rounded-lg transition-all duration-300",
                isActive 
                  ? "bg-white/20" 
                  : `${item.bgColor} group-hover:scale-110`
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive ? "text-white" : item.textColor
                )} />
              </div>
              
              {!collapsed && (
                <span className="relative z-10">{item.title}</span>
              )}

              {/* Badge de notification (exemple) */}
              {item.href === "/unpaid" && !collapsed && (
                <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full animate-pulse">
                  !
                </span>
              )}

              {/* Tooltip pour mode collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-slate-700">
                  {item.title}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700" />
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="relative border-t border-white/10 p-3">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm",
          collapsed && "justify-center"
        )}>
          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
          </div>
          
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {session?.user?.name}
              </div>
              <div className={cn(
                "inline-block px-2 py-0.5 text-[10px] font-bold text-white rounded-full mt-1",
                roleBadge.color
              )}>
                {roleBadge.label}
              </div>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          className={cn(
            "w-full mt-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group",
            collapsed ? "justify-center px-2" : "justify-start"
          )}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
          {!collapsed && <span className="ml-2">Déconnexion</span>}
        </Button>
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
