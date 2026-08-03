import { Fragment } from "react";
import { BLOCK_MAP } from "@/blocks/registry";
import { renderWpHtml } from "@/components/content/wpHtml";
import type { PageBlocks } from "@/lib/db/schema";

export default function BlockRenderer({ blocks }: { blocks: PageBlocks }) {
  const content = Array.isArray(blocks?.content) ? blocks.content : [];
  return (
    <>
      {content.map((node, i) => {
        const def = BLOCK_MAP[node.type];
        const key = (node.props?.id as string) || `${node.type}-${i}`;
        if (!def) {
          const html = node.props?.html;
          return html ? <Fragment key={key}>{renderWpHtml(String(html))}</Fragment> : null;
        }
        return <Fragment key={key}>{def.render(node.props)}</Fragment>;
      })}
    </>
  );
}
