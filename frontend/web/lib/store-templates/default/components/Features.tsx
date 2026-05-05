import { FeaturesProps } from '../../types'

export function Features({ features }: FeaturesProps) {
  if (!features || features.length === 0) return null

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="text-center">
              {feature.icon && <div className="text-3xl mb-3">{feature.icon}</div>}
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}