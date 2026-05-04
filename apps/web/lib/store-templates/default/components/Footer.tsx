import { FooterProps } from '../../types'

export function Footer({ storeName, links, socialLinks }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="font-bold text-lg">{storeName}</h3>
          </div>
          {links && links.length > 0 && (
            <nav className="flex gap-6 mb-4 md:mb-0">
              {links.map((link) => (
                <a key={link.label} href={link.href} className="text-gray-400 hover:text-white text-sm">
                  {link.label}
                </a>
              ))}
            </nav>
          )}
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}