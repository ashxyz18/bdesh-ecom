import { useState, useEffect, useRef } from 'react'

type Brand = {
  id: string
  name: string
  logo?: string
}

type BrandLogosProps = {
  brands?: Brand[]
}

export default function BrandLogos({ brands = [] }: BrandLogosProps) {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.2 }
    )

    const el = sectionRef.current
    if (el) observer.observe(el)

    return () => {
      if (el) observer.unobserve(el)
    }
  }, [brands])

  if (brands.length === 0) {
    const defaultBrands = [
      { id: '1', name: 'ROSEO', logo: '' },
      { id: '2', name: 'LUXE', logo: '' },
      { id: '3', name: 'PREMIUM', logo: '' },
      { id: '4', name: 'ELITE', logo: '' },
      { id: '5', name: 'CLASSIC', logo: '' },
    ]
    
    return (
      <section
        ref={sectionRef}
        className={`py-6 border-b border-neutral-100 bg-neutral-50/50 transition-opacity duration-700 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex items-center gap-8 md:gap-12">
            {[...defaultBrands, ...defaultBrands].map((brand, index) => (
              <div key={`${brand.id}-${index}`} className="flex-shrink-0 group">
                <div className="w-24 h-24 bg-white rounded-xl border border-neutral-200 flex items-center justify-center group-hover:border-primary-300 group-hover:shadow-md transition-all duration-300 overflow-hidden group-hover:scale-105">
                  <span className="text-neutral-900 font-bold text-lg group-hover:text-primary-900 transition-colors duration-300">
                    {brand.name.charAt(0)}
                  </span>
                </div>
                <span className="block text-center text-xs font-medium text-neutral-400 group-hover:text-primary-900 mt-2 transition-colors duration-300">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const marqueeBrands = [...brands, ...brands]

  return (
    <section
      ref={sectionRef}
      className={`py-6 border-b border-neutral-100 bg-neutral-50/50 transition-opacity duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
        <div className="flex items-center gap-8 md:gap-12">
          {marqueeBrands.map((brand, index) => (
            <div
              key={`${brand.id}-${index}`}
              className="flex-shrink-0 group"
            >
              <div className="w-24 h-24 bg-white rounded-xl border border-neutral-200 flex flex-col items-center justify-center group-hover:border-primary-300 group-hover:shadow-md transition-all duration-300 overflow-hidden group-hover:scale-105">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-neutral-900 font-bold text-lg group-hover:text-primary-900 transition-colors duration-300">
                    {brand.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="block text-center text-xs font-medium text-neutral-400 group-hover:text-primary-900 mt-2 transition-colors duration-300">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}