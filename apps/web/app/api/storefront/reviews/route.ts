import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, storeId, rating, title, comment, userId } = body;

    if (!productId || !storeId || !rating || !userId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if user already reviewed this product
    const existing = await prisma.review.findFirst({
      where: { productId, userId },
    });

    if (existing) {
      return NextResponse.json(
        { message: "You have already reviewed this product" },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating: parseInt(rating),
        title: title || null,
        comment: comment || null,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    return NextResponse.json({
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        userName: review.user.name,
        createdAt: review.createdAt ? new Date(review.createdAt).toISOString() : new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to create review" },
      { status: 400 }
    );
  }
}
