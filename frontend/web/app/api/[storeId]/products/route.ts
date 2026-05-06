import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const featured = searchParams.get("featured");
    const status = searchParams.get("status") || "active";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = { storeId };

    // Filter by status (admin can see all)
    if (status !== "all") {
      where.status = status;
    }

    // Search in name and description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by category (via collection)
    if (category) {
      where.collections = {
        some: {
          collection: {
            slug: category,
          },
        },
      };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Filter featured products
    if (featured === "true") {
      where.featured = true;
    }

    // Build orderBy
    let orderBy: any = { [sortBy]: sortOrder };
    if (sortBy === "price") {
      orderBy = { price: sortOrder };
    } else if (sortBy === "name") {
      orderBy = { name: sortOrder };
    } else {
      orderBy = { createdAt: sortOrder };
    }

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Get products
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        variants: true,
        collections: {
          include: {
            collection: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    // Calculate average rating for each product
    const productsWithRating = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;
      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        reviews: undefined,
      };
    });

    return NextResponse.json({
      products: productsWithRating,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
