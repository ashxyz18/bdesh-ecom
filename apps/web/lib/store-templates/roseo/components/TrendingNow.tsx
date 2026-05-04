import { Flame, Clock, Star } from 'lucide-react'

type Product = {
  id: string
  name: string
  price: number
  originalPrice?: number
  rating?: number
  image: string
  material?: string
}

export default function TrendingNow({ products = [] }: { products?: Product[] }) {
  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-semibold tracking-widest uppercase mb-3">
              <Flame className="w-3.5 h-3.5" />
              Hot Right Now
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-neutral-900">
              Trending <span className="text-gradient-primary">Now</span>
            </h2>
            <p className="text-neutral-500 text-sm mt-1">Most popular picks this week</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-neutral-300 transition-all duration-500">
                <div className="relative aspect-[4/3] bg-neutral-50 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-neutral-200">{product.name.charAt(0)}</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 w-8 h-8 bg-primary-900 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                    {index + 1}
                  </div>

                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-1 mb-1.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-neutral-500">{product.rating?.toFixed(1) || '4.8'}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-primary-900 transition-colors duration-300 line-clamp-1 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mb-2">{product.material || 'Premium Leather'}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-neutral-900">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-neutral-400 line-through">${product.originalPrice.toFixed(2)}</span>
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