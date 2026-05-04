import { Clock, X } from 'lucide-react'

type Product = {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
}

type RecentlyViewedProps = {
  products?: Product[]
  onClear?: () => void
}

export default function RecentlyViewed({ products = [], onClear }: RecentlyViewedProps) {
  if (products.length === 0) {
    return null
  }

  const handleClear = () => {
    if (onClear) onClear()
  }

  return (
    <section className="py-12 bg-neutral-50 border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-neutral-400" />
            <h3 className="font-display text-lg font-bold text-neutral-900">Recently Viewed</h3>
            <span className="text-xs text-neutral-400">({products.length} items)</span>
          </div>
          <button
            onClick={handleClear}
            className="text-xs text-neutral-400 hover:text-red-500 transition-colors duration-200 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:border-neutral-300 transition-all duration-400">
                <div className="aspect-square bg-neutral-50 overflow-hidden relative">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-neutral-200">{product.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-medium text-neutral-900 line-clamp-1 group-hover:text-primary-900 transition-colors">
                    {product.name}
                  </h4>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-sm font-bold text-neutral-900">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-[10px] text-neutral-400 line-through">${product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}