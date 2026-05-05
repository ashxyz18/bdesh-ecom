import { NavbarProps } from '../../types'

export function Navbar({ storeName, cartCount, onCartClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <span className="font-bold text-lg">{storeName}</span>
          <button onClick={onCartClick} className="relative p-2">
            <span className="text-sm">Cart ({cartCount})</span>
          </button>
        </div>
      </div>
    </header>
  )
}