import { Navbar } from "@/components/marketing/Navbar";
import { TemplateGallery, type GalleryTemplate } from "./TemplateGallery";
import { BUILTIN_TEMPLATES } from "@/lib/storefront/templates";
import { prisma } from "@/lib/db";

// Static cache: built-in templates never change between deploys, custom
// templates rarely. Vercel revalidates the whole page every 5 minutes which
// is dramatically faster than the previous client-fetch waterfall.
export const revalidate = 300;

export const metadata = {
  title: "Templates — BixelBD",
  description: "Browse pre-built ecommerce website templates. Start your store in minutes.",
};

async function loadTemplates(): Promise<GalleryTemplate[]> {
  const builtin: GalleryTemplate[] = BUILTIN_TEMPLATES.map((t) => ({
    id: t.slug,
    slug: t.slug,
    name: t.name,
    description: t.description,
    thumbnail: t.thumbnail,
    category: t.category,
    previewUrl: `/templates/preview/${t.slug}`,
    isBuiltIn: true,
  }));

  let custom: GalleryTemplate[] = [];
  try {
    const rows = await prisma.template.findMany({
      where: { isPublic: true, buildStatus: "ready", isBuiltIn: false },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        thumbnail: true,
        category: true,
      },
    });
    custom = rows.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      description: t.description,
      thumbnail: t.thumbnail,
      category: t.category,
      previewUrl: `/templates/${t.id}`,
      isBuiltIn: false,
    }));
  } catch (error) {
    // Never block the gallery on a DB hiccup — built-ins still load.
    console.error("Failed to load custom templates:", error);
  }

  return [...builtin, ...custom];
}

export default async function TemplatesPage() {
  const templates = await loadTemplates();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Template</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse our collection of pre-built website templates. Select one and
            start building your online store in minutes.
          </p>
        </header>
        <TemplateGallery templates={templates} />
      </div>
    </div>
  );
}
