import { prisma } from "@bdesh/database";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

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
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.session.create({
    data: { userId, token: hashedToken, expiresAt },
  });

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  const sessions = await prisma.session.findMany({
    where: { 
      expiresAt: { gt: new Date() }
    },
    include: { user: true },
  });

  // Find matching session by comparing tokens
  for (const session of sessions) {
    if (await verifyToken(token, session.token)) {
      return session;
    }
  }
  
  return null;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (token) {
    const sessions = await prisma.session.findMany({});
    for (const session of sessions) {
      if (await verifyToken(token, session.token)) {
        await prisma.session.deleteMany({ where: { id: session.id } });
        break;
      }
    }
  }

  cookieStore.delete("session");
}

export async function getSessionUser() {
  const session = await getSession();
  return session?.user || null;
}
