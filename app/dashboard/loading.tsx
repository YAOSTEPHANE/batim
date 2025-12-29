import { DashboardStatsSkeleton, ChartSkeleton, RecentSalesSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton-loaders"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <PageHeaderSkeleton />
      
      {/* Stats Cards */}
      <DashboardStatsSkeleton />
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ChartSkeleton height={250} />
        <ChartSkeleton height={250} />
      </div>
      
      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <RecentSalesSkeleton />
        </div>
        <ChartSkeleton height={200} />
      </div>
    </div>
  )
}




