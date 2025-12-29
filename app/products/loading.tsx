import { ProductsGridSkeleton, PageHeaderSkeleton, Skeleton } from "@/components/ui/skeleton-loaders"

export default function ProductsLoading() {
  return (
    <div className="p-6 space-y-6">
      <PageHeaderSkeleton />
      
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 flex-1 max-w-md rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      
      {/* Products Grid */}
      <ProductsGridSkeleton count={12} />
    </div>
  )
}




