import Image from 'next/image'
import { ProductCardProps } from '../../types'

export function ProductCard({ product, onAddToCart, onViewProduct }: ProductCardProps) {
  return (
    <div className="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-square bg-gray-50">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            📦
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-800 line-clamp-2 mb-1">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">${product.price.toFixed(2)}</span>
          <button 
            onClick={onViewProduct}
            className="text-xs text-blue-600 hover:underline"
          >
            View
          </button>
        </div>
      </div>
    </div>
  )
}