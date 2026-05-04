import { FilterTabsProps } from '../../types'

export default function FilterTabs({ activeFilter, setActiveFilter }: FilterTabsProps) {
  const tabs = [
    { id: 'all', label: 'All Products' },
    { id: 'men', label: 'Men' },
    { id: 'women', label: 'Women' },
    { id: 'fragrances', label: 'Fragrances' },
    { id: 'backpacks', label: 'Backpacks' },
    { id: 'new', label: 'New Arrivals' },
    { id: 'popular', label: 'Popular' },
    { id: 'sale', label: 'Sale' },
  ]

  return (
    <section className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`relative flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeFilter === tab.id
                  ? 'text-primary-900'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              {tab.label}
              {activeFilter === tab.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-900 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}