import bcrypt from "bcryptjs";

export function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const userData = localStorage.getItem("user");
  if (!userData) return {};
  try {
    const user = JSON.parse(userData);
    return user?.id ? { "x-user-id": user.id } : {};
  } catch {
    return {};
  }
}

export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem("user");
  if (!userData) return null;
  try {
    const user = JSON.parse(userData);
    return user?.id || null;
  } catch {
    return null;
  }
}

export function getStoreId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("storeId");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}