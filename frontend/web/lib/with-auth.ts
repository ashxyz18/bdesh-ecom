import { NextRequest, NextResponse } from "next/server";
import { getSession, SessionWithUser } from "./auth";

export interface AuthOptions {
  roles?: string[]; // If specified, user must have one of these roles
}

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, session: SessionWithUser) => Promise<NextResponse>,
  options: AuthOptions = {}
): Promise<NextResponse> {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check role if specified
    if (options.roles && !options.roles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return handler(req, session);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
