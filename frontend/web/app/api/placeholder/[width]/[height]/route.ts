import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ width: string; height: string }> }
) {
  const { width, height } = await params;
  const w = parseInt(width) || 400;
  const h = parseInt(height) || 300;
  const text = req.nextUrl.searchParams.get("text") || `${w}x${h}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="#f0f0f0"/>
    <text x="${w / 2}" y="${h / 2}" font-family="Arial, sans-serif" font-size="${Math.min(w, h) / 10}" fill="#999" text-anchor="middle" dominant-baseline="middle">
      ${text}
    </text>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
