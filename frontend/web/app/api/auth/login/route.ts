import { NextRequest } from "next/server";
import { prisma, getStoreByOwnerId, parseStoreJson } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { apiResponse, apiError, cacheConfig } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiError("Email and password are required", 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return apiError("Invalid credentials", 401);
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return apiError("Invalid credentials", 401);
    }

    const store = await getStoreByOwnerId(user.id);

    return apiResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.toLowerCase(),
          createdAt: user.createdAt,
        },
        store: parseStoreJson(store),
      },
      { cache: cacheConfig.noCache }
    );
  } catch (error) {
    console.error("Login error:", error);
    return apiError("Internal server error", 500);
  }
}
