export function getSubdomain(host: string): string | null {
  if (!host || host.includes("localhost") || host.includes("vercel.app")) {
    return null;
  }

  const parts = host.split(".");
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

export function isMainDomain(host: string): boolean {
  return getSubdomain(host) === null;
}
