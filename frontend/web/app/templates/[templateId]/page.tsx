import { Navbar } from "@/components/marketing/Navbar";
import { Button } from "@/components/shared/Button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Monitor } from "lucide-react";

const templates: Record<string, {
  id: string;
  name: string;
  description: string;
  category: string;
  previewUrl: string;
  pages: { name: string; file: string; description: string }[];
  features: string[];
}> = {
  koskii: {
    id: "koskii",
    name: "Koskii Ethnic Wear",
    description: "A beautiful e-commerce template designed for ethnic wear, fashion boutiques, and clothing stores. Features product sliders, category grids, and a modern shopping experience with mobile-responsive design.",
    category: "Fashion",
    previewUrl: "/prebuilt-templates/koskii/index.html",
    pages: [
      { name: "Home", file: "index.html", description: "Main storefront with hero slider and product showcases" },
      { name: "Product", file: "product.html", description: "Product detail page with images and add to cart" },
      { name: "Account", file: "account.html", description: "User account and profile page" },
      { name: "Wishlist", file: "wishlist.html", description: "Saved items wishlist page" },
    ],
    features: ["Responsive Design", "Product Slider", "Category Grid", "Wishlist", "Search Overlay", "Mobile Navigation", "Announcement Bar"],
  },
};

interface PageProps {
  params: Promise<{ templateId: string }>;
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { templateId } = await params;
  const template = templates[templateId];

  if (!template) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <Link href="/templates" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={16} /> Back to Templates
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{template.name}</h1>
            <p className="text-gray-600 mb-6">{template.description}</p>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b border-gray-200">
                <div className="flex gap-2">
                  <button className="p-2 rounded-md hover:bg-gray-200" title="Desktop">
                    <Monitor size={18} />
                  </button>
                </div>
                <span className="text-sm text-gray-500">{template.pages[0].name} Preview</span>
              </div>
              <iframe
                src={template.previewUrl}
                className="w-full h-[600px] border-0"
                title="Template Preview"
              />
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">All Pages</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {template.pages.map((page) => (
                  <div key={page.file} className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{page.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{page.description}</p>
                    <a
                      href={template.previewUrl.replace("index.html", page.file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-[#1d4ed8] hover:underline"
                    >
                      <Eye size={14} /> View page
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Start with this template</h2>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Features included:</p>
                <ul className="space-y-2">
                  {template.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Link href={`/templates/${templateId}/use`}>
                <Button className="w-full justify-center bg-[#1d4ed8] hover:bg-[#1e40af] text-white py-3 text-base">
                  Use This Template
                </Button>
              </Link>

              <p className="text-xs text-gray-500 text-center mt-4">
                Free to use. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}