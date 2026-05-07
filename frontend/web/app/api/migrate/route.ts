import { NextResponse } from "next/server";
import { execSync } from "child_process";

// Runtime migration endpoint for platforms without entrypoint hooks (e.g., AWS Amplify)
// Call this once after deployment: curl -X POST https://your-app.amplifyapp.com/api/migrate
// IMPORTANT: Protect this endpoint in production with a secret key
export async function POST(request: Request) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  const migrateSecret = process.env.MIGRATE_SECRET;

  if (migrateSecret && authHeader !== `Bearer ${migrateSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only allow in production or if explicitly enabled
  if (process.env.NODE_ENV === "development" && !process.env.ALLOW_DEV_MIGRATE) {
    return NextResponse.json({ error: "Not allowed in development" }, { status: 403 });
  }

  try {
    console.log("Running database migrations...");
    const output = execSync(
       "npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma",
      {
        encoding: "utf-8",
        timeout: 60000,
        env: {
          ...process.env,
          // Ensure DIRECT_URL is used for migrations (not the pooled connection)
          DATABASE_URL: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
      }
    );
    console.log("Migration output:", output);

    return NextResponse.json({
      success: true,
      output,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Migration failed:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
