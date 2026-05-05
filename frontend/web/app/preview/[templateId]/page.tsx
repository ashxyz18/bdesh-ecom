import { notFound } from "next/navigation";
import { getStoreTemplate, isBuiltInTemplate, templateList } from "@/lib/store-templates/registry";
import { getDemoStore } from "@/lib/store-templates/shared/demoData";
import { StoreProviders } from "@/app/store/[[...path]]/providers";
import { PreviewBanner } from "./PreviewBanner";
import { prisma } from "@/lib/prisma";

interface PreviewPageProps {
  params: Promise<{ templateId: string }>;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { templateId } = await params;

  // Built-in template: use React component
  if (isBuiltInTemplate(templateId)) {
    const templateInfo = templateList.find(t => t.id === templateId);
    if (!templateInfo) {
      return notFound();
    }

    const StoreTemplate = getStoreTemplate(templateId);
    const demoStore = getDemoStore(templateId);

    return (
      <div className="relative">
        <PreviewBanner templateId={templateId} templateName={templateInfo.name} />
        <StoreProviders storeId={demoStore.id}>
          <StoreTemplate store={demoStore} path={[]} />
        </StoreProviders>
      </div>
    );
  }

  // Custom template: load config from DB and use ConfigTemplateWrapper
  let templateRecord = await prisma.template.findUnique({
    where: { slug: templateId },
    select: { id: true, name: true, config: true },
  });

  if (!templateRecord) {
    // Also try by ID
    templateRecord = await prisma.template.findUnique({
      where: { id: templateId },
      select: { id: true, name: true, config: true },
    });
    if (!templateRecord) {
      return notFound();
    }
  }

  const configJson = typeof templateRecord.config === "string"
    ? templateRecord.config
    : JSON.stringify(templateRecord.config);

  const demoStore = getDemoStore("default");
  const ConfigTemplateWrapper = (await import("@/lib/store-templates/engine/ConfigTemplateWrapper")).ConfigTemplateWrapper;

  return (
    <div className="relative">
      <PreviewBanner templateId={templateId} templateName={templateRecord.name} />
      <StoreProviders storeId={demoStore.id}>
        <ConfigTemplateWrapper store={demoStore} path={[]} configJson={configJson} />
      </StoreProviders>
    </div>
  );
}

export function generateStaticParams() {
  return templateList.map(t => ({ templateId: t.id }));
}
