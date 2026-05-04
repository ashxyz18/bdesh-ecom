import { ProductCard } from './ProductCard'
import { ProductGridProps } from '../../types'

export function ProductGrid({ products, onAddToCart, onViewProduct }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">No products found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={() => onAddToCart(product)}
          onViewProduct={() => onViewProduct({ ...product, description: product.description })}
        />
      ))}
    </div>
  )
}