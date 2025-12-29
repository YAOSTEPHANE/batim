import { StatCardSkeleton, ChartSkeleton, TableSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton-loaders"

export default function ReportsLoading() {
  return (
    <div className="p-6 space-y-6">
      <PageHeaderSkeleton />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height={300} />
        <ChartSkeleton height={300} />
      </div>
      
      {/* Table */}
      <TableSkeleton rows={8} columns={6} />
    </div>
  )
}




