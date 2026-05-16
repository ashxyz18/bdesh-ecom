import { Loader2 } from "lucide-react";

export default function TemplatesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse mx-auto mb-4" />
          <div className="h-5 w-96 bg-gray-100 rounded-lg animate-pulse mx-auto" />
        </div>

        {/* Search Skeleton */}
        <div className="max-w-md mx-auto mb-10">
          <div className="h-11 w-full bg-gray-200 rounded-xl animate-pulse" />
        </div>

        {/* Categories Skeleton */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
          ))}
        </div>

        {/* Templates Grid Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                <div className="flex gap-3 pt-2">
                  <div className="h-10 flex-1 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-10 flex-1 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
