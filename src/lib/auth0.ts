import { Auth0Client } from "@auth0/nextjs-auth0/server";

function build(): Auth0Client | null {
  if (!process.env.APP_BASE_URL && process.env.VERCEL_URL) {
    process.env.APP_BASE_URL = `https://${process.env.VERCEL_URL}`;
  }

  const {
    AUTH0_DOMAIN,
    AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET,
    AUTH0_SECRET,
    APP_BASE_URL,
  } = process.env;
  if (
    !AUTH0_DOMAIN ||
    !AUTH0_CLIENT_ID ||
    !AUTH0_CLIENT_SECRET ||
    !AUTH0_SECRET ||
    !APP_BASE_URL
  ) {
    return null;
  }
  try {
    return new Auth0Client();
  } catch (e) {
    console.error("[auth0] init failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

export const auth0 = build();

export function isAuthConfigured(): boolean {
  return auth0 !== null;
}

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

export interface SessionUser {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: unknown;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (!auth0) return null;
  try {
    const session = await auth0.getSession();
    return (session?.user as SessionUser) ?? null;
  } catch {
    return null;
  }
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  return isAdminEmail(user?.email);
}
