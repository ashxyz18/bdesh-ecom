export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail: string;
  previewUrl: string;
  pages: { name: string; file: string; description: string }[];
  colors: { primary: string; accent: string; background: string };
}

const TEMPLATE_MANIFESTS: Record<string, () => Promise<Template>> = {
  // Templates are now loaded dynamically from the database and /public/templates/
};

export async function getTemplates(): Promise<Template[]> {
  const templates: Template[] = [];

  for (const [id] of Object.entries(TEMPLATE_MANIFESTS)) {
    try {
      const template = await getTemplate(id);
      if (template) {
        templates.push(template);
      }
    } catch (error) {
      console.error(`Failed to load template ${id}:`, error);
    }
  }

  return templates;
}

export async function getTemplate(id: string): Promise<Template | null> {
  const loader = TEMPLATE_MANIFESTS[id];
  if (!loader) return null;

  try {
    const manifest = await loader();
    return manifest;
  } catch {
    return null;
  }
}

export function getAllTemplateIds(): string[] {
  return Object.keys(TEMPLATE_MANIFESTS);
}