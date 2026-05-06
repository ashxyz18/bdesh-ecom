import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validateTemplateConfig } from "@/lib/store-templates/engine/types";
import { WebsiteType } from "@prisma/client";

// GET /api/templates — List templates (public for all, all for admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const websiteType = searchParams.get("websiteType");
    const checkSlug = searchParams.get("check");
    const includeConfig = searchParams.get("includeConfig") === "true";

    // Check slug uniqueness
    if (checkSlug) {
      const existing = await prisma.template.findUnique({
        where: { slug: checkSlug },
      });
      return NextResponse.json({ exists: !!existing });
    }

    // Build where clause — default: public templates only
    const where: any = { isPublic: true };
    if (category) {
      where.category = category;
    }
    if (websiteType) {
      where.websiteType = websiteType.toUpperCase();
    }

    // Admin sees all templates (including private/draft)
    let session = null;
    try {
      session = await requireAuth();
    } catch {}

    if (session?.user && session.user.role === "ADMIN") {
      delete where.isPublic;
    }

    const templates = await prisma.template.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        thumbnail: true,
        category: true,
        websiteType: true,
        isPremium: true,
        isPublic: true,
        isBuiltIn: true,
        uploadedBy: true,
        downloads: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        ...(includeConfig ? { config: true } : {}),
      },
      orderBy: [
        { isBuiltIn: "desc" },
        { downloads: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ templates });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST /api/templates — Create/upload a new template (ADMIN only)
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    // Only admins can upload templates
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Only administrators can upload templates" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, slug, description, thumbnail, config, category, websiteType, isPremium, isPublic } = body;

    // Validate required fields
    if (!name || !slug || !config) {
      return NextResponse.json(
        { message: "Name, slug, and config are required" },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json(
        { message: "Slug must be lowercase alphanumeric with hyphens only" },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await prisma.template.findUnique({
      where: { slug },
    });
    if (existing) {
      return NextResponse.json(
        { message: "A template with this slug already exists" },
        { status: 409 }
      );
    }

    // Parse and validate config
    let configObj = config;
    if (typeof config === "string") {
      try {
        configObj = JSON.parse(config);
      } catch {
        return NextResponse.json(
          { message: "Invalid JSON in config field" },
          { status: 400 }
        );
      }
    }

    const validation = validateTemplateConfig(configObj);
    if (!validation.valid) {
      return NextResponse.json(
        { message: "Invalid template configuration", errors: validation.errors },
        { status: 400 }
      );
    }

    // Only admins can create built-in or premium templates
    const template = await prisma.template.create({
      data: {
        name,
        slug,
        description: description || null,
        thumbnail: thumbnail || null,
        config: typeof configObj === "string" ? configObj : JSON.stringify(configObj),
        category: category || "general",
        websiteType: (websiteType?.toUpperCase() as WebsiteType) || WebsiteType.ECOMMERCE,
        isPremium: isPremium || false,
        isPublic: isPublic !== false,
        isBuiltIn: false,
        uploadedBy: session.user.id as unknown as string,
        version: "1.0.0",
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to create template" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
