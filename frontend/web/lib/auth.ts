import { prisma } from "@bdesh/database";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createHash } from "crypto";

/** Session with included user relation */
export interface SessionWithUser {
  id: string;
  userId: string;
  token: string;
  lookupHash: string | null;
  expiresAt: Date;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar: string | null;
    phone: string | null;
    password: string;
    emailVerified: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Generate a deterministic lookup hash from a session token.
 * This allows O(1) session lookup instead of loading ALL sessions
 * and doing bcrypt compare on each one.
 */
function tokenLookupHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

export async function verifyToken(token: string, hashedToken: string): Promise<boolean> {
  return bcrypt.compare(token, hashedToken);
}

export function generateToken(): string {
  return crypto.randomUUID();
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createSession(userId: string) {
  const token = generateToken();
  const hashedToken = await hashToken(token);
  const lookupHash = tokenLookupHash(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const sessionData: any = { userId, token: hashedToken, expiresAt, lookupHash };
  await prisma.session.create({
    data: sessionData,
  });

  return token;
}

export async function getSession(): Promise<SessionWithUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) return null;

    // Use lookup hash for O(1) query instead of loading all sessions
    const lookupHash = tokenLookupHash(token);

    const session = await prisma.session.findUnique({
      where: { lookupHash } as any,
      include: { user: true },
    }) as SessionWithUser | null;

    if (!session) return null;

    // Check expiry
    if (session.expiresAt < new Date()) {
      // Clean up expired session
      await prisma.session.deleteMany({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    // Verify the token matches (security check against hash collisions)
    const isValid = await verifyToken(token, session.token);
    if (!isValid) return null;

    return session;
  } catch (error) {
    console.error("[auth] getSession error:", error);
    return null;
  }
}

export async function requireAuth(): Promise<SessionWithUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (token) {
      // Use lookup hash for O(1) deletion
      const lookupHash = tokenLookupHash(token);
      await prisma.session.deleteMany({ where: { lookupHash } as any }).catch(() => {});
    }

    cookieStore.delete("session");
  } catch (error) {
    console.error("[auth] logout error:", error);
    // Still delete the cookie even if DB fails
    try {
      const cookieStore = await cookies();
      cookieStore.delete("session");
    } catch {}
  }
}

export async function getSessionUser() {
  const session = await getSession();
  return session?.user || null;
}
