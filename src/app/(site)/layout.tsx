import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/lib/db/client";
import { pages } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getNavPages() {
  if (!db) return [];
  try {
    return await db
      .select({ key: pages.key, route: pages.route, title: pages.title })
      .from(pages)
      .where(and(eq(pages.kind, "page"), eq(pages.status, "published")));
  } catch {
    return [];
  }
}

function navLabel(route: string, title: string | null): string {
  if (title) return title;
  if (route === "/") return "Home";
  const seg = route.replace(/^\/|\/$/g, "").split("/").pop() || "";
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const navPages = await getNavPages();
  // Home first, then the rest in a stable order
  const sorted = [...navPages].sort((a, b) => (a.route === "/" ? -1 : b.route === "/" ? 1 : a.route.localeCompare(b.route)));

  return (
    <>
      <header style={{ borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 50, background: "#fff" }}>
        <nav style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", gap: "28px" }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: "16px", textDecoration: "none", color: "#111827" }}>
            Site
          </Link>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {sorted.map((p) => (
              <Link
                key={p.key}
                href={p.route}
                style={{ fontSize: "14px", color: "#374151", textDecoration: "none" }}
              >
                {navLabel(p.route, p.title)}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      {children}
      <footer style={{ borderTop: "1px solid #e5e7eb", marginTop: "48px", padding: "24px", textAlign: "center", fontSize: "13px", color: "#6b7280" }}>
        Powered by the multi-site platform
      </footer>
    </>
  );
}
