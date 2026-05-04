import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validateTemplateConfig } from "@/lib/store-templates/engine/types";

interface RouteContext {
  params: Promise<{ templateId: string }>;
}

// GET /api/templates/[templateId] — Get single template
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { templateId } = await params;

    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      // Also try by slug
      const bySlug = await prisma.template.findUnique({
        where: { slug: templateId },
      });
      if (!bySlug) {
        return NextResponse.json(
          { message: "Template not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ template: bySlug });
    }

    // Non-public templates only visible to admins
    if (!template.isPublic) {
      try {
        const session = await requireAuth();
        if (session.user.role !== "ADMIN") {
          return NextResponse.json(
            { message: "Template not found" },
            { status: 404 }
          );
        }
      } catch {
        return NextResponse.json(
          { message: "Template not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ template });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch template" },
      { status: 500 }
    );
  }
}

// PATCH /api/templates/[templateId] — Update template (ADMIN only)
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth();

    // Only admins can update templates
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Only administrators can update templates" },
        { status: 403 }
      );
    }

    const { templateId } = await params;

    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    // Built-in templates can't be modified
    if (template.isBuiltIn) {
      return NextResponse.json(
        { message: "Built-in templates cannot be modified" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updates: any = {};

    // Whitelisted updatable fields
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.thumbnail !== undefined) updates.thumbnail = body.thumbnail;
    if (body.category !== undefined) updates.category = body.category;
    if (body.isPremium !== undefined) updates.isPremium = body.isPremium;
    if (body.isPublic !== undefined) updates.isPublic = body.isPublic;
    if (body.version !== undefined) updates.version = body.version;

    // Validate config if provided
    if (body.config !== undefined) {
      let configObj = body.config;
      if (typeof configObj === "string") {
        try {
          configObj = JSON.parse(configObj);
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

      updates.config = typeof configObj === "string" ? configObj : JSON.stringify(configObj);
    }

    const updated = await prisma.template.update({
      where: { id: templateId },
      data: updates,
    });

    return NextResponse.json({ template: updated });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update template" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

// DELETE /api/templates/[templateId] — Delete template (ADMIN only)
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth();

    // Only admins can delete templates
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Only administrators can delete templates" },
        { status: 403 }
      );
    }

    const { templateId } = await params;

    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    // Built-in templates can't be deleted
    if (template.isBuiltIn) {
      return NextResponse.json(
        { message: "Built-in templates cannot be deleted" },
        { status: 403 }
      );
    }

    await prisma.template.delete({
      where: { id: templateId },
    });

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to delete template" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
