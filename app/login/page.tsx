"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { 
  Wrench, 
  Hammer, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff,
  Loader2,
  Sparkles,
  Shield,
  Cog,
  Paintbrush,
  type LucideIcon
} from "lucide-react"

// Composant pour les images flottantes 3D
function FloatingImage({ 
  src, 
  alt,
  className, 
  delay = 0,
  duration = 6,
  size = 80
}: { 
  src: string
  alt: string
  className: string
  delay?: number
  duration?: number
  size?: number
}) {
  return (
    <div 
      className={`absolute ${className}`}
      style={{
        animation: `float3D ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <div className="relative p-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl hover:scale-110 transition-transform duration-300">
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="rounded-xl object-cover"
          unoptimized
        />
        {/* Effet de brillance */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 via-transparent to-transparent" />
      </div>
    </div>
  )
}

// Composant pour les icônes flottantes 3D (fallback)
function FloatingIcon({ 
  icon: Icon, 
  className, 
  delay = 0,
  duration = 6
}: { 
  icon: LucideIcon
  className: string
  delay?: number
  duration?: number
}) {
  return (
    <div 
      className={`absolute ${className}`}
      style={{
        animation: `float3D ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
        <Icon className="w-8 h-8 text-white/80" />
      </div>
    </div>
  )
}

// Composant pour les particules
function Particle({ delay }: { delay: number }) {
  const randomX = Math.random() * 100
  const randomDuration = 15 + Math.random() * 10
  
  return (
    <div
      className="absolute w-1 h-1 bg-white/30 rounded-full"
      style={{
        left: `${randomX}%`,
        bottom: '-10px',
        animation: `particleRise ${randomDuration}s linear infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  )
}

// URLs d'images de quincaillerie (Unsplash)
const toolImages = [
  {
    src: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200&h=200&fit=crop",
    alt: "Outils de bricolage",
    className: "top-[10%] left-[5%]",
    delay: 0,
    duration: 8,
    size: 90
  },
  {
    src: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=200&h=200&fit=crop",
    alt: "Marteau et clous",
    className: "top-[20%] right-[8%]",
    delay: 1.5,
    duration: 7,
    size: 85
  },
  {
    src: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=200&h=200&fit=crop",
    alt: "Perceuse électrique",
    className: "bottom-[25%] left-[3%]",
    delay: 0.8,
    duration: 9,
    size: 80
  },
  {
    src: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=200&h=200&fit=crop",
    alt: "Peinture et pinceaux",
    className: "bottom-[15%] right-[5%]",
    delay: 2,
    duration: 6,
    size: 85
  },
  {
    src: "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=200&h=200&fit=crop",
    alt: "Vis et boulons",
    className: "top-[55%] left-[8%]",
    delay: 1,
    duration: 8,
    size: 70
  },
  {
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop",
    alt: "Clés à molette",
    className: "top-[5%] right-[20%]",
    delay: 2.5,
    duration: 7,
    size: 75
  }
]

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [imagesLoaded, setImagesLoaded] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Délai pour charger les images
    const timer = setTimeout(() => setImagesLoaded(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Erreur de connexion",
          description: "Email ou mot de passe incorrect",
          variant: "destructive",
        })
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Fond animé avec dégradé */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Image de fond avec overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504917595217-d4dc5ebb6122?w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Grille 3D */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'center top',
          }}
        />
        
        {/* Orbes lumineux */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full filter blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full filter blur-[120px]" />
        <div className="absolute top-[10%] right-[20%] w-64 h-64 bg-pink-500/20 rounded-full filter blur-[80px] animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-[10%] left-[15%] w-72 h-72 bg-cyan-500/20 rounded-full filter blur-[90px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        
        {/* Particules */}
        {mounted && Array.from({ length: 30 }).map((_, i) => (
          <Particle key={i} delay={i * 0.5} />
        ))}
      </div>

      {/* Images flottantes 3D */}
      {mounted && imagesLoaded && (
        <>
          {toolImages.map((img, index) => (
            <FloatingImage
              key={index}
              src={img.src}
              alt={img.alt}
              className={img.className}
              delay={img.delay}
              duration={img.duration}
              size={img.size}
            />
          ))}
        </>
      )}

      {/* Icônes flottantes supplémentaires */}
      {mounted && (
        <>
          <FloatingIcon icon={Sparkles} className="top-[40%] right-[3%]" delay={1.2} duration={7} />
          <FloatingIcon icon={Shield} className="bottom-[40%] right-[12%]" delay={0.3} duration={8} />
        </>
      )}

      {/* Carte de connexion 3D */}
      <div 
        className={`
          relative z-10 w-full max-w-md mx-4
          transition-all duration-1000 ease-out
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        `}
      >
        {/* Effet de lueur derrière la carte */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 rounded-3xl blur-lg opacity-75 animate-pulse" />
        
        <div 
          className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
          style={{
            transform: 'perspective(1000px) rotateX(2deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* En-tête avec animation */}
          <div className="relative px-8 pt-10 pb-6 text-center">
            {/* Logo animé avec image */}
            <div className="relative inline-block mb-6">
              <div 
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-2xl overflow-hidden"
                style={{
                  animation: 'logoFloat 3s ease-in-out infinite',
                  transform: 'translateZ(30px)',
                }}
              >
                {/* Image du logo */}
                <Image
                  src="https://images.unsplash.com/photo-1581147036324-c17ac41f3e6a?w=200&h=200&fit=crop"
                  alt="Logo Quincaillerie"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover opacity-90"
                  unoptimized
                />
                {/* Overlay avec icône */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/60 via-pink-500/60 to-blue-500/60 flex items-center justify-center">
                  <Wrench className="w-12 h-12 text-white drop-shadow-lg" style={{ animation: 'logoSpin 10s linear infinite' }} />
                </div>
              </div>
              {/* Anneau lumineux */}
              <div className="absolute -inset-2 rounded-3xl border-2 border-purple-400/50 animate-ping" style={{ animationDuration: '2s' }} />
              {/* Petites étoiles autour */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent">
                Quincaillerie
              </span>
            </h1>
            <p className="text-white/60 text-sm">
              Système de Gestion Intelligent
            </p>
          </div>

          {/* Bannière décorative */}
          <div className="relative h-16 mx-8 mb-4 rounded-xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=800&h=200&fit=crop"
              alt="Outils de quincaillerie"
              fill
              className="object-cover opacity-40"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 via-transparent to-blue-500/50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white/90 text-sm font-medium tracking-wide">
                ✨ Bienvenue dans votre espace de gestion ✨
              </p>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-6">
            {/* Champ Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80 text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Adresse Email
              </Label>
              <div className={`
                relative group transition-all duration-300
                ${focusedField === 'email' ? 'scale-[1.02]' : ''}
              `}>
                <div className={`
                  absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 blur transition-opacity duration-300
                  ${focusedField === 'email' ? 'opacity-75' : 'group-hover:opacity-50'}
                `} />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={loading}
                  className="relative h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-purple-400 focus:ring-purple-400/50 transition-all duration-300"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80 text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Mot de passe
              </Label>
              <div className={`
                relative group transition-all duration-300
                ${focusedField === 'password' ? 'scale-[1.02]' : ''}
              `}>
                <div className={`
                  absolute -inset-0.5 rounded-xl bg-gradient-to-r from-pink-500 to-blue-500 opacity-0 blur transition-opacity duration-300
                  ${focusedField === 'password' ? 'opacity-75' : 'group-hover:opacity-50'}
                `} />
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    disabled={loading}
                    className="relative h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-purple-400 focus:ring-purple-400/50 pr-12 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Bouton de connexion */}
            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="relative w-full h-12 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
              >
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connexion en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Se connecter
                  </span>
                )}
              </Button>
            </div>

            {/* Séparateur avec icônes */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-transparent text-white/40 text-xs flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  Accès sécurisé
                  <Shield className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="text-center">
              <p className="text-white/40 text-xs">
                Contactez l'administrateur si vous avez oublié vos identifiants
              </p>
            </div>
          </form>

          {/* Effet de reflet en bas */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>

        {/* Badges en bas de la carte */}
        <div className="flex justify-center gap-4 mt-6">
          <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 text-xs flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Système actif
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 text-xs flex items-center gap-1.5">
            <Shield className="w-3 h-3" />
            SSL Sécurisé
          </div>
        </div>
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes float3D {
          0%, 100% {
            transform: translateY(0) translateZ(0) rotateY(0deg);
          }
          25% {
            transform: translateY(-20px) translateZ(20px) rotateY(5deg);
          }
          50% {
            transform: translateY(-10px) translateZ(10px) rotateY(-5deg);
          }
          75% {
            transform: translateY(-25px) translateZ(15px) rotateY(3deg);
          }
        }

        @keyframes particleRise {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(0.5);
            opacity: 0;
          }
        }

        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0) translateZ(30px) rotateY(0deg);
          }
          50% {
            transform: translateY(-10px) translateZ(40px) rotateY(10deg);
          }
        }

        @keyframes logoSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
