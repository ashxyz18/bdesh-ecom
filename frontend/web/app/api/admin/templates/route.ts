import { NextRequest, NextResponse } from 'next/server';
import { getTemplates, addTemplate, removeTemplate, templateExists } from '@/lib/templates/registry';
import { generateManifestFromFiles, generateProductCardTemplate } from '@/lib/templates/manifest-generator';
import { users } from '@/lib/data-store';

function isAdmin(request: NextRequest, userId?: string | null): boolean {
  // Check for admin role in x-user-id header (set by client after login)
  const idToCheck = userId || request.headers.get('x-user-id');
  if (!idToCheck) return false;
  const user = users.get(idToCheck);
  if (user?.role === 'admin') return true;
  
  // Fallback: if no user found, check if x-user-id starts with "admin-" 
  // (since fallback admin users get IDs like "admin-abc123")
  if (idToCheck.startsWith('admin-')) return true;
  
  return false;
}

async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Try header first
  const headerUserId = request.headers.get('x-user-id');
  if (headerUserId) return headerUserId;
  
  // Fallback: try to get userId from form data (for POST requests with FormData)
  try {
    const clonedRequest = request.clone();
    const formData = await clonedRequest.formData();
    const formUserId = formData.get('userId');
    if (formUserId) return formUserId as string;
  } catch (error) {
    // Not a form data request, ignore
  }
  
  return null;
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const templates = await getTemplates();

    return NextResponse.json({
      success: true,
      templates: templates.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        thumbnail: t.thumbnail,
        previewUrl: t.previewUrl,
      })),
    });
  } catch (error) {
    console.error('Failed to get templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get user ID from form data or header (fallback for both old and new clients)
    const userId = (formData.get('userId') as string) || request.headers.get('x-user-id');
    if (!userId || !isAdmin(request, userId)) {
      return NextResponse.json({ success: false, error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    const file = formData.get('zip') as File;
    const name = formData.get('name') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No ZIP file provided' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Template name is required' },
        { status: 400 }
      );
    }

    const templateId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (await templateExists(templateId)) {
      return NextResponse.json(
        { success: false, error: 'A template with this name already exists' },
        { status: 409 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(buffer);

    const entries = zip.getEntries();

    const files: { path: string; content: Buffer }[] = [];
    let hasHtml = false;

    for (const entry of entries) {
      if (entry.isDirectory) continue;

      const entryPath = entry.entryName.replace(/\\/g, '/');

      if (entryPath.toLowerCase().endsWith('.html') || entryPath.toLowerCase().endsWith('.htm')) {
        hasHtml = true;
      }

      files.push({
        path: entryPath,
        content: Buffer.from(entry.getData()),
      });
    }

    if (!hasHtml) {
      return NextResponse.json(
        { success: false, error: 'ZIP must contain at least one HTML file' },
        { status: 400 }
      );
    }

    const { manifest } = await generateManifestFromFiles(templateId, name, files);

    manifest.description = `Uploaded template: ${name}`;

    const productCardTemplate = generateProductCardTemplate();
    files.push({
      path: 'product-card.html',
      content: Buffer.from(productCardTemplate),
    });

    const result = await addTemplate(templateId, manifest, files);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      templateId,
      name: manifest.name,
      previewUrl: manifest.previewUrl,
    });
  } catch (error) {
    console.error('Failed to upload template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload template' },
      { status: 500 }
    );
  }
}