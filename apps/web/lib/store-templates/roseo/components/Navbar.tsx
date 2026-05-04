import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { NavbarProps } from '../../types'

export default function Navbar({ storeName, cartCount, onCartClick }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-primary-900 border-b border-primary-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-display font-bold text-white">
            {storeName || 'ROSEO'}
          </Link>
          <button 
            onClick={onCartClick}
            className="relative flex items-center gap-2 text-primary-200 hover:text-white transition-colors"
          >
            <ShoppingCart size={20} />
            <span className="text-sm font-medium">Cart ({cartCount})</span>
          </button>
        </div>
      </div>
    </nav>
  )
}