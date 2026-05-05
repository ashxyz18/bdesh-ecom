import { HeroSectionProps } from '../../types'

export default function HeroSection({ title, subtitle, backgroundImage }: HeroSectionProps) {
  return (
    <section className="relative h-screen min-h-[500px] flex items-center justify-center">
      {backgroundImage ? (
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-primary-950" />
      )}
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative text-center text-white max-w-3xl px-4">
        <h1 className="text-5xl md:text-6xl font-display mb-6">{title || 'Premium Leather Bags'}</h1>
        {subtitle && <p className="text-xl md:text-2xl mb-8 opacity-90">{subtitle}</p>}
      </div>
    </section>
  )
}