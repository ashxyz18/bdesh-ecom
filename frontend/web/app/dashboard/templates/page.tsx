import { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { TemplatePreview } from "@/components/marketing/TemplatePreview";
import { Loader2, Filter, Grid, List } from "lucide-react";
import { revalidatePath } from "next/cache";

function FilterSection({ categories, websiteTypes, selectedCategory, selectedType }: {
  categories: string[];
  websiteTypes: string[];
  selectedCategory?: string;
  selectedType?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Website Type</h3>
        <div className="space-y-2">
          <Link
            href="/dashboard/templates"
            className={`block px-3 py-2 rounded-lg text-sm transition ${
              !selectedType ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
            }`}
          >
            All Types
          </Link>
          {websiteTypes.map((type) => (
            <Link
              key={type}
              href={`/dashboard/templates?websiteType=${type}`}
              className={`block px-3 py-2 rounded-lg text-sm capitalize transition ${
                selectedType === type ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
              }`}
            >
              {type.toLowerCase()}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Category</h3>
        <div className="space-y-2">
          <Link
            href="/dashboard/templates"
            className={`block px-3 py-2 rounded-lg text-sm transition ${
              !selectedCategory ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
            }`}
          >
            All Categories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/dashboard/templates?category=${cat}`}
              className={`block px-3 py-2 rounded-lg text-sm transition ${
                selectedCategory === cat ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function TemplateMarketplacePage({
  searchParams,
}: {
  searchParams: { category?: string; websiteType?: string };
}) {
  const session = await getSession();
  const selectedCategory = searchParams.category;
  const selectedType = searchParams.websiteType;

  // Build where clause
  const where: any = { isPublic: true };
  if (selectedCategory) where.category = selectedCategory;
  if (selectedType) where.websiteType = selectedType.toUpperCase();

  // Fetch templates
  const [templates, categories, websiteTypes] = await Promise.all([
    prisma.template.findMany({
      where,
      orderBy: [
        { isBuiltIn: "desc" },
        { downloads: "desc" },
      ],
    }),
    prisma.template.groupBy({
      by: ["category"],
      where: { isPublic: true },
      _count: { category: true },
    }),
    prisma.template.groupBy({
      by: ["websiteType"],
      where: { isPublic: true },
      _count: { websiteType: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Template Marketplace</h1>
            <p className="text-gray-600 mt-2">
              Choose a template to start building your site
            </p>
          </div>
          {session?.user?.role === "ADMIN" && (
            <Link href="/dashboard/templates/upload">
              <Button>Upload Template</Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters - hidden on mobile, shown via sheet */}
          <div className="hidden lg:block">
            <FilterSection
              categories={categories.map((c) => c.category)}
              websiteTypes={websiteTypes.map((t) => t.websiteType)}
              selectedCategory={selectedCategory}
              selectedType={selectedType}
            />
          </div>

          {/* Template Grid */}
          <div className="lg:col-span-3">
            {templates.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500">No templates found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition"
                  >
                    <div className="aspect-video bg-gray-100">
                      <TemplatePreview
                        templateId={template.slug}
                        name={template.name}
                        websiteType={template.websiteType.toLowerCase()}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        {template.isPremium && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {template.description || "A beautiful template"}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="capitalize">{template.websiteType.toLowerCase()}</span>
                        <span>•</span>
                        <span>{template.category}</span>
                        <span>•</span>
                        <span>{template.downloads} downloads</span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/preview/${template.slug}?websiteType=${template.websiteType.toLowerCase()}`}
                          target="_blank"
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" className="w-full">
                            Preview
                          </Button>
                        </Link>
                        <Link href={`/register?template=${template.slug}`} className="flex-1">
                          <Button size="sm" className="w-full">
                            Use Template
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
