import { NextResponse } from "next/server";
import { getTemplates } from "@/lib/templates/registry";

export async function GET() {
  try {
    const templates = await getTemplates();
    return NextResponse.json({
      success: true,
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        thumbnail: t.thumbnail,
        previewUrl: t.previewUrl,
        entryPoint: t.manifest?.entryPoint,
        sections: t.manifest?.sections
          ? Object.keys(t.manifest.sections)
          : [],
      })),
    });
  } catch (error) {
    console.error("Failed to get templates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get templates" },
      { status: 500 }
    );
  }
}
