import { FooterProps } from '../../types'

export default function Footer({ storeName, links, socialLinks }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 pb-12 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-lg">R</span>
              </div>
              <span className="font-serif text-2xl font-bold">{storeName || 'ROSEO'}</span>
            </div>
            <p className="text-gray-400 max-w-md mb-8">
              Crafting premium leather bags that blend timeless elegance with modern functionality.
              Each piece tells a story of craftsmanship and attention to detail.
            </p>
          </div>

          {links && links.length > 0 && (
            <div className="grid grid-cols-2 gap-8">
              {links.map((link) => (
                <a key={link.label} href={link.href} className="text-gray-400 hover:text-white text-sm">
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="pt-8">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} {storeName || 'ROSEO'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}