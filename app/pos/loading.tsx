import { ProductsGridSkeleton, Skeleton } from "@/components/ui/skeleton-loaders"

export default function POSLoading() {
  return (
    <div className="flex h-screen">
      {/* Products Section */}
      <div className="flex-1 p-6 space-y-4 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
        
        {/* Search */}
        <Skeleton className="h-12 w-full rounded-xl" />
        
        {/* Products */}
        <ProductsGridSkeleton count={8} />
      </div>
      
      {/* Cart Section */}
      <div className="w-96 border-l border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        
        {/* Cart Items */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
        
        {/* Totals */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        
        {/* Checkout Button */}
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}




