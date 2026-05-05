import { FeaturesProps } from '../../types'
import { Truck, CreditCard, Shield, RefreshCw } from 'lucide-react'

export default function Features({ features }: FeaturesProps) {
  const defaultFeatures = features || [
    { icon: <Truck className="w-5 h-5" />, title: 'Free Shipping', description: 'On orders over $200' },
    { icon: <Shield className="w-5 h-5" />, title: 'Quality Guarantee', description: '2-Year warranty on all products' },
    { icon: <CreditCard className="w-5 h-5" />, title: 'Secure Payment', description: '100% secure checkout' },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {defaultFeatures.map((feature, i) => (
            <div key={i} className="text-center p-6 rounded-xl border border-neutral-200 hover:border-primary-900 transition-all duration-300">
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-900 mb-4 mx-auto">
                {feature.icon}
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 text-neutral-900">{feature.title}</h3>
              <p className="text-neutral-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}