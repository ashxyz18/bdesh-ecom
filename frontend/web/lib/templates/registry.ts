import { TemplateManifest } from './manifest';
import { createDefaultManifest } from './manifest';
import fs from 'fs';
import path from 'path';

const TEMPLATES_DIR = path.join(process.cwd(), 'public', 'templates');

export interface TemplateInfo {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  previewUrl: string;
  manifest: TemplateManifest;
  buildStatus?: 'pending' | 'installing' | 'building' | 'ready' | 'failed';
}

let templateCache: Map<string, TemplateInfo> = new Map();
let cacheInitialized = false;

export async function initializeTemplateCache(): Promise<void> {
  if (cacheInitialized) return;

  try {
    if (!fs.existsSync(TEMPLATES_DIR)) {
      fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
    }

    const entries = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const manifestPath = path.join(TEMPLATES_DIR, entry.name, 'manifest.json');

        if (fs.existsSync(manifestPath)) {
          try {
            const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
            const manifest = JSON.parse(manifestContent) as TemplateManifest;

            templateCache.set(entry.name, {
              id: manifest.id,
              name: manifest.name,
              description: manifest.description,
              thumbnail: manifest.thumbnail,
              previewUrl: manifest.previewUrl || `/templates/${entry.name}/${manifest.entryPoint}`,
              manifest,
              buildStatus: 'ready',
            });
          } catch (e) {
            console.error(`Failed to load template ${entry.name}:`, e);
          }
        } else {
          const htmlPath = path.join(TEMPLATES_DIR, entry.name, 'index.html');
          if (fs.existsSync(htmlPath)) {
            const manifest = createDefaultManifest(entry.name, entry.name, 'index.html', ['css/style.css'], ['js/main.js']);
            manifest.previewUrl = `/templates/${entry.name}/index.html`;

            templateCache.set(entry.name, {
              id: entry.name,
              name: entry.name,
              previewUrl: manifest.previewUrl!,
              manifest,
              buildStatus: 'ready',
            });
          }
        }
      }
    }

    cacheInitialized = true;
  } catch (error) {
    console.error('Failed to initialize template cache:', error);
  }
}

export async function getTemplates(): Promise<TemplateInfo[]> {
  await initializeTemplateCache();
  return Array.from(templateCache.values());
}

export async function getTemplate(id: string): Promise<TemplateInfo | null> {
  await initializeTemplateCache();
  return templateCache.get(id) || null;
}

export async function getTemplateManifest(id: string): Promise<TemplateManifest | null> {
  const template = await getTemplate(id);
  return template?.manifest || null;
}

export async function addTemplate(
  id: string,
  manifest: TemplateManifest,
  files: { path: string; content: Buffer }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const templateDir = path.join(TEMPLATES_DIR, id);

    if (fs.existsSync(templateDir)) {
      return { success: false, error: 'Template already exists' };
    }

    fs.mkdirSync(templateDir, { recursive: true });

    for (const file of files) {
      const filePath = path.join(templateDir, file.path);
      const fileDir = path.dirname(filePath);

      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      fs.writeFileSync(filePath, file.content);
    }

    const manifestPath = path.join(templateDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    templateCache.set(id, {
      id: manifest.id,
      name: manifest.name,
      description: manifest.description,
      thumbnail: manifest.thumbnail,
      previewUrl: manifest.previewUrl || `/templates/${id}/${manifest.entryPoint}`,
      manifest,
      buildStatus: 'ready',
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to add template:', error);
    return { success: false, error: String(error) };
  }
}

export async function removeTemplate(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const templateDir = path.join(TEMPLATES_DIR, id);

    if (!fs.existsSync(templateDir)) {
      return { success: false, error: 'Template not found' };
    }

    fs.rmSync(templateDir, { recursive: true, force: true });
    templateCache.delete(id);

    return { success: true };
  } catch (error) {
    console.error('Failed to remove template:', error);
    return { success: false, error: String(error) };
  }
}

export async function templateExists(id: string): Promise<boolean> {
  await initializeTemplateCache();
  return templateCache.has(id);
}

export function getTemplatesDir(): string {
  return TEMPLATES_DIR;
}

export function refreshCache(): void {
  cacheInitialized = false;
  templateCache.clear();
  initializeTemplateCache();
}