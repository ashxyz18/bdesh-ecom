import Image from 'next/image'

type Product = {
  id: string
  name: string
  price: number
  image: string
  description?: string
}

interface ProductCardProps {
  product: Product
  onAddToCart: () => void
  onViewProduct: () => void
}

export function ProductCard({ product, onAddToCart, onViewProduct }: ProductCardProps) {
  return (
    <div className="group cursor-pointer" onClick={onViewProduct}>
      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            ??
          </div>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
          className="absolute bottom-3 right-3 px-3 py-1.5 bg-white text-gray-900 text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Add to Cart
        </button>
      </div>
      <h3 className="font-serif text-lg font-medium text-gray-900">{product.name}</h3>
      <p className="text-amber-700 font-semibold mt-1"></p>
    </div>
  )
}
