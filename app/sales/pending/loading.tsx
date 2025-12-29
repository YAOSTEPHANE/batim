import { MainLayout } from "@/components/layout/main-layout"
import { Skeleton } from "@/components/ui/skeleton-loaders"

export default function PendingSalesLoading() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        {/* Header skeleton */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-16 w-16 rounded-2xl bg-white/20" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64 bg-white/20" />
              <Skeleton className="h-4 w-96 bg-white/20" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl bg-white/20" />
            ))}
          </div>
        </div>

        {/* Sales skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl bg-white/10" />
          ))}
        </div>
      </div>
    </MainLayout>
  )
}




