import { StatCardSkeleton, PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton-loaders"

export default function UnpaidLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/20 to-orange-50/30 p-6 space-y-6">
      {/* Header */}
      <Skeleton className="h-48 w-full rounded-2xl" />
      
      {/* Alert */}
      <Skeleton className="h-20 w-full rounded-xl" />
      
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-80 rounded-xl" />
        <Skeleton className="h-10 w-40 rounded-xl ml-auto" />
      </div>
      
      {/* Unpaid Items */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border-2 border-gray-200 bg-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="p-3 rounded-xl bg-gray-50">
                      <Skeleton className="h-3 w-16 mb-2" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-10 w-28 rounded-lg" />
                <Skeleton className="h-10 w-28 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}




