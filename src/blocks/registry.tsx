import { createElement, type CSSProperties, type ReactNode } from "react";
import { renderWpHtml } from "@/components/content/wpHtml";

export interface BlockDef {
  type: string;
  label: string;
  category: string;
  fields: Record<string, unknown>;
  defaultProps: Record<string, unknown>;
  render: (props: Record<string, unknown>) => ReactNode;
}

const str = (v: unknown, fallback = ""): string => (v == null ? fallback : String(v));

function parseStyle(s?: string): CSSProperties | undefined {
  if (!s) return undefined;
  const out: Record<string, string> = {};
  for (const decl of s.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!prop || !val) continue;
    const key = prop.startsWith("--") ? prop : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    out[key] = val;
  }
  return out as CSSProperties;
}

const cls = (v: unknown): string | undefined => { const s = str(v).trim(); return s || undefined; };

const ALIGN_OPTS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
];

// ── Content blocks ────────────────────────────────────────────────────────────

const heading: BlockDef = {
  type: "Heading",
  label: "Heading",
  category: "Content",
  fields: {
    text: { type: "text" },
    level: { type: "select", options: [1, 2, 3, 4, 5, 6].map((n) => ({ label: `H${n}`, value: n })) },
    align: { type: "select", options: [{ label: "Default", value: "" }, ...ALIGN_OPTS] },
    className: { type: "text" },
    style: { type: "text" },
  },
  defaultProps: { text: "Heading", level: 2, align: "", className: "", style: "" },
  render: (p) =>
    createElement(
      `h${Number(p.level) || 2}`,
      {
        className: cls(`wp-block-heading${p.align ? ` has-text-align-${str(p.align)}` : ""}${p.className ? ` ${str(p.className)}` : ""}`),
        style: parseStyle(str(p.style)),
      },
      str(p.text)
    ),
};

const paragraph: BlockDef = {
  type: "Paragraph",
  label: "Text",
  category: "Content",
  fields: {
    text: { type: "textarea" },
    className: { type: "text" },
    style: { type: "text" },
  },
  defaultProps: { text: "<p>Paragraph text.</p>", className: "", style: "" },
  render: (p) => <>{renderWpHtml(str(p.text))}</>,
};

const list: BlockDef = {
  type: "List",
  label: "List",
  category: "Content",
  fields: {
    tag: { type: "select", options: [{ label: "Bullet", value: "ul" }, { label: "Numbered", value: "ol" }] },
    items: { type: "textarea" },
    className: { type: "text" },
    style: { type: "text" },
  },
  defaultProps: { tag: "ul", items: "Item 1\nItem 2", className: "", style: "" },
  render: (p) => {
    const items = str(p.items).split("\n").filter(Boolean);
    return createElement(
      str(p.tag, "ul"),
      { className: cls(p.className), style: parseStyle(str(p.style)) },
      items.map((item, i) => createElement("li", { key: i, dangerouslySetInnerHTML: { __html: item } }))
    );
  },
};

const image: BlockDef = {
  type: "Image",
  label: "Image",
  category: "Content",
  fields: {
    src: { type: "text" },
    alt: { type: "text" },
    className: { type: "text" },
    style: { type: "text" },
  },
  defaultProps: { src: "", alt: "", className: "", style: "" },
  render: (p) => (
    <div className="wp-block-image">
      <figure className={cls(`aligncenter size-large ${str(p.className)}`) || undefined}>
        <img src={str(p.src)} alt={str(p.alt)} style={parseStyle(str(p.style))} loading="lazy" decoding="async" />
      </figure>
    </div>
  ),
};

const spacer: BlockDef = {
  type: "Spacer",
  label: "Spacer",
  category: "Content",
  fields: { height: { type: "number" } },
  defaultProps: { height: 24 },
  render: (p) => <div style={{ height: Number(p.height) || 24 }} aria-hidden="true" className="wp-block-spacer" />,
};

const button: BlockDef = {
  type: "Button",
  label: "Button / CTA",
  category: "Content",
  fields: {
    label: { type: "text" },
    href: { type: "text" },
    variant: { type: "select", options: [{ label: "Primary", value: "primary" }, { label: "Accent", value: "accent" }, { label: "Ghost", value: "ghost" }] },
    align: { type: "select", options: [{ label: "Default", value: "" }, ...ALIGN_OPTS] },
  },
  defaultProps: { label: "Learn More", href: "#", variant: "primary", align: "" },
  render: (p) => {
    const wrapStyle = p.align ? ({ textAlign: str(p.align) as "center", display: "block" } as CSSProperties) : undefined;
    const el = createElement("a", { className: `gs-block-btn gs-block-btn-${str(p.variant, "primary")}`, href: str(p.href, "#") }, str(p.label, "Learn more"));
    return wrapStyle ? createElement("div", { style: wrapStyle }, el) : el;
  },
};

const separator: BlockDef = {
  type: "Separator",
  label: "Separator",
  category: "Content",
  fields: {},
  defaultProps: {},
  render: () => <hr className="wp-block-separator has-alpha-channel-opacity" />,
};

// ── Section blocks ────────────────────────────────────────────────────────────

const hero: BlockDef = {
  type: "Hero",
  label: "Hero",
  category: "Sections",
  fields: {
    title: { type: "text" },
    subtitle: { type: "textarea" },
    backgroundImage: { type: "text" },
    html: { type: "textarea", label: "Source HTML" },
  },
  defaultProps: { title: "", subtitle: "", backgroundImage: "", html: "" },
  render: (p) => <>{renderWpHtml(str(p.html))}</>,
};

const mediaText: BlockDef = {
  type: "MediaText",
  label: "Media & Text",
  category: "Sections",
  fields: {
    heading: { type: "text" },
    text: { type: "textarea" },
    image: { type: "text" },
    html: { type: "textarea", label: "Source HTML" },
  },
  defaultProps: { heading: "", text: "", image: "", html: "" },
  render: (p) => <>{renderWpHtml(str(p.html))}</>,
};

const columns: BlockDef = {
  type: "Columns",
  label: "Columns",
  category: "Sections",
  fields: {
    items: { type: "textarea", label: "Column items (read-only summary)" },
    html: { type: "textarea", label: "Source HTML" },
  },
  defaultProps: { items: "[]", html: "" },
  render: (p) => <>{renderWpHtml(str(p.html))}</>,
};

const ctaBlock: BlockDef = {
  type: "CTA",
  label: "Call to Action",
  category: "Sections",
  fields: {
    heading: { type: "text" },
    text: { type: "textarea" },
    html: { type: "textarea", label: "Source HTML" },
  },
  defaultProps: { heading: "", text: "", html: "" },
  render: (p) => <>{renderWpHtml(str(p.html))}</>,
};

const tableBlock: BlockDef = {
  type: "Table",
  label: "Table",
  category: "Content",
  fields: {
    html: { type: "textarea", label: "Source HTML" },
  },
  defaultProps: { html: "" },
  render: (p) => <>{renderWpHtml(str(p.html))}</>,
};

const contentSection: BlockDef = {
  type: "ContentSection",
  label: "Content Section",
  category: "Sections",
  fields: {
    heading: { type: "text" },
    body: { type: "textarea" },
    html: { type: "textarea", label: "Source HTML" },
  },
  defaultProps: { heading: "", body: "", html: "" },
  render: (p) => <>{renderWpHtml(str(p.html))}</>,
};

// ── Passthrough blocks ────────────────────────────────────────────────────────

const richText: BlockDef = {
  type: "RichText",
  label: "Rich text",
  category: "Content",
  fields: { html: { type: "textarea" } },
  defaultProps: { html: "<p>Rich text block.</p>" },
  render: (p) => <>{renderWpHtml(str(p.html))}</>,
};

const rawHtml: BlockDef = {
  type: "RawHtml",
  label: "Section (HTML)",
  category: "Advanced",
  fields: { html: { type: "textarea" } },
  defaultProps: { html: "" },
  render: (p) => <>{renderWpHtml(str(p.html))}</>,
};

const formEmbed: BlockDef = {
  type: "FormEmbed",
  label: "Form",
  category: "Advanced",
  fields: { html: { type: "textarea" } },
  defaultProps: { html: "" },
  render: (p) => <>{renderWpHtml(str(p.html))}</>,
};

const scriptEmbed: BlockDef = {
  type: "ScriptEmbed",
  label: "Script",
  category: "Advanced",
  fields: { html: { type: "textarea" } },
  defaultProps: { html: "" },
  render: (p) => <>{renderWpHtml(str(p.html))}</>,
};

const styleBlock: BlockDef = {
  type: "StyleBlock",
  label: "Style",
  category: "Advanced",
  fields: { html: { type: "textarea" } },
  defaultProps: { html: "" },
  render: (p) => <>{renderWpHtml(str(p.html))}</>,
};

export const BLOCKS: BlockDef[] = [
  heading, paragraph, list, image, button, spacer, separator,
  hero, mediaText, columns, ctaBlock, tableBlock, contentSection,
  richText, rawHtml, formEmbed, scriptEmbed, styleBlock,
];
export const BLOCK_MAP: Record<string, BlockDef> = Object.fromEntries(
  BLOCKS.map((b) => [b.type, b])
);
