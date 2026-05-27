import Link from "next/link";

interface TemplateCard {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  previewUrl: string;
}

interface Props {
  templates: TemplateCard[];
}

/**
 * Server-rendered featured-templates strip on the marketing landing.
 * Replaces the previous client-side fetch + skeleton waterfall — the cards
 * render in the initial HTML response.
 */
export function LandingTemplatePreview({ templates }: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {templates.map((t) => (
        <Link key={t.id} href={`/templates/preview/${t.id}`} className="group">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#1d4ed8]/20">
            <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
              {/* Native <img> with eager loading on the visible above-the-fold
                  cards keeps LCP fast without next/image's hydration cost. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.thumbnail}
                alt={t.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{t.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">{t.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
