import { HeroSectionProps } from '../../types'

export function HeroSection({ title, subtitle, ctaText, ctaLink, backgroundImage }: HeroSectionProps) {
  return (
    <section className="relative h-96 bg-gray-100 flex items-center justify-center">
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      <div className="relative text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        {subtitle && <p className="text-lg text-gray-600 max-w-xl mx-auto">{subtitle}</p>}
        {ctaText && ctaLink && (
          <a 
            href={ctaLink} 
            className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  )
}