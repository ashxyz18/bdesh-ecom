import { QuickViewModalProps } from '../../types'

export function QuickViewModal({ product, isOpen, onClose, onAddToCart }: QuickViewModalProps) {
  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <h2 className="font-bold text-lg mb-4">{product.name}</h2>
        {product.image && (
          <div className="w-full h-48 bg-gray-100 rounded mb-4" />
        )}
        <p className="text-gray-600 mb-4">${product.price.toFixed(2)}</p>
        {product.description && <p className="text-sm text-gray-500 mb-4">{product.description}</p>}
        <div className="flex gap-2">
          <button 
            onClick={onClose}
            className="flex-1 py-2 border rounded-lg"
          >
            Close
          </button>
          <button 
            onClick={onAddToCart}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}