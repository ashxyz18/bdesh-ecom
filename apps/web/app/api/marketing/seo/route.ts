import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  return NextResponse.json({
    score: 78,
    suggestions: [
      {
        type: "title",
        message: body.title
          ? "Title length is good, consider adding a power word"
          : "Missing page title — this is critical for SEO",
        priority: body.title ? "medium" : "high" as const,
      },
      {
        type: "keywords",
        message: "Consider targeting long-tail keywords specific to Bangladesh market",
        priority: "medium" as const,
      },
    ],
    optimized: {
      title: body.title,
      description: body.description,
      keywords: [],
    },
  });
}
