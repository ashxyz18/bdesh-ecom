import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from "@/lib/rate-limit";
import { z } from "zod";

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId");
    const approvedOnly = searchParams.get("approved") !== "false";

    const where: any = {};
    if (productId) where.productId = productId;
    if (userId) where.userId = userId;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        product: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      reviews,
      stats: {
        total: reviews.length,
        averageRating: Math.round(avgRating * 10) / 10,
        distribution: {
          1: reviews.filter(r => r.rating === 1).length,
          2: reviews.filter(r => r.rating === 2).length,
          3: reviews.filter(r => r.rating === 3).length,
          4: reviews.filter(r => r.rating === 4).length,
          5: reviews.filter(r => r.rating === 5).length,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Rate limit: 5 reviews per hour per IP
  const rateResult = checkRateLimit(req, RATE_LIMITS.analytics, getClientIdentifier(req));
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait." },
      { status: 429, headers: rateResult.headers }
    );
  }

  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = reviewSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { productId, rating, title, comment } = validation.data;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: { productId, userId: user.id },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        rating,
        title,
        comment,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "MERCHANT")) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { reviewId, action } = body;

    if (!reviewId || !action) {
      return NextResponse.json(
        { error: "reviewId and action are required" },
        { status: 400 }
      );
    }

    if (action === "delete") {
      await prisma.review.delete({
        where: { id: reviewId },
      });
      return NextResponse.json({ message: "Review deleted" });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update review" },
      { status: 500 }
    );
  }
}
