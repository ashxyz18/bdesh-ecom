import { ProductCard } from './ProductCard'

type Product = {
  id: string
  name: string
  price: number
  image: string
  description?: string
}

interface RoseoProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
  onViewProduct: (product: Product) => void
}

export function ProductGrid({ products, onAddToCart, onViewProduct }: RoseoProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">No products found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={() => onAddToCart(product)}
          onViewProduct={() => onViewProduct(product)}
        />
      ))}
    </div>
  )
}
