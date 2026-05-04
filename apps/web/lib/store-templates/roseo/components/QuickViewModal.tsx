type Product = {
  id: string
  name: string
  price: number
  image: string
  description?: string
}

interface QuickViewModalProps {
  product?: Product
  isOpen: boolean
  onClose: () => void
  onAddToCart: () => void
}

export default function QuickViewModal({ product, isOpen, onClose, onAddToCart }: QuickViewModalProps) {
  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <h2 className="font-serif text-2xl font-bold mb-4">{product.name}</h2>
        {product.image && (
          <div className="w-full h-64 bg-gray-100 rounded mb-4" />
        )}
        <p className="text-amber-700 font-semibold mb-4"></p>
        {product.description && <p className="text-sm text-gray-600 mb-4">{product.description}</p>}
        <div className="flex gap-2">
          <button 
            onClick={onClose}
            className="flex-1 py-2 border rounded-lg"
          >
            Close
          </button>
          <button 
            onClick={onAddToCart}
            className="flex-1 py-2 bg-amber-900 text-white rounded-lg font-medium"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
