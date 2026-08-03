import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pages } from "@/lib/db/schema";
import type { PageBlocks } from "@/lib/db/schema";
import BlockRenderer from "@/blocks/BlockRenderer";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug?: string[] }>;
}

async function getPage(slug: string[]) {
  if (!db) return null;
  const route = "/" + (slug.join("/") || "");
  const rows = await db.select().from(pages).where(eq(pages.route, route)).limit(1);
  return rows[0] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return {
    title: page.title ?? undefined,
    description: page.description ?? undefined,
    openGraph: {
      title: page.ogTitle ?? page.title ?? undefined,
      description: page.ogDescription ?? page.description ?? undefined,
      images: page.ogImage ? [page.ogImage] : undefined,
    },
  };
}

export default async function CatchAllPage({ params }: Props) {
  const { slug = [] } = await params;

  const page = await getPage(slug);
  if (!page || page.status !== "published") notFound();

  const blocks = page.blocks as PageBlocks | null;
  if (blocks?.content?.length) {
    return (
      <main>
        <BlockRenderer blocks={blocks} />
      </main>
    );
  }

  if (page.content) {
    return (
      <main dangerouslySetInnerHTML={{ __html: page.content }} />
    );
  }

  notFound();
}
