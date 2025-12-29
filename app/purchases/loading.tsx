import { TableSkeleton, PageHeaderSkeleton, StatCardSkeleton } from "@/components/ui/skeleton-loaders"

export default function PurchasesLoading() {
  return (
    <div className="p-6 space-y-6">
      <PageHeaderSkeleton />
      
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Table */}
      <TableSkeleton rows={10} columns={7} />
    </div>
  )
}




