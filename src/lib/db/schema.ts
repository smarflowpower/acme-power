import {
  pgTable,
  serial,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

// ── Block model (Puck) ────────────────────────────────────────────────────────
export interface BlockNode {
  type: string;
  props: Record<string, unknown> & { id: string };
}
export interface PageBlocks {
  content: BlockNode[];
  root?: { props?: Record<string, unknown> };
  zones?: Record<string, BlockNode[]>;
}

// ── CMS pages ─────────────────────────────────────────────────────────────────
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  route: text("route").notNull().unique(),
  kind: text("kind").notNull().default("page"),
  status: text("status").notNull().default("published"),
  bodyClass: text("body_class").notNull().default(""),

  title: text("title"),
  description: text("description"),
  robots: text("robots"),
  canonical: text("canonical"),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  ogType: text("og_type"),
  twitterCard: text("twitter_card"),

  jsonLd: jsonb("json_ld").$type<string[]>().default([]),
  head: jsonb("head").$type<unknown[]>().default([]),
  scripts: jsonb("scripts").$type<string[]>().default([]),
  content: text("content").notNull().default(""),

  blocks: jsonb("blocks").$type<PageBlocks | null>().default(null),
  draftBlocks: jsonb("draft_blocks").$type<PageBlocks | null>().default(null),
  draftUpdatedAt: timestamp("draft_updated_at", { withTimezone: true }),

  updatedBy: text("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Page revisions ────────────────────────────────────────────────────────────
export const pageRevisions = pgTable("page_revisions", {
  id: serial("id").primaryKey(),
  pageKey: text("page_key").notNull(),
  blocks: jsonb("blocks").$type<PageBlocks | null>().default(null),
  content: text("content"),
  label: text("label"),
  status: text("status").notNull().default("draft"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Site settings ─────────────────────────────────────────────────────────────
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<Record<string, unknown>>().default({}),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Products / inventory ──────────────────────────────────────────────────────
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  url: text("url").notNull().default(""),
  title: text("title").notNull().default(""),
  fullName: text("full_name"),
  brand: text("brand").notNull().default(""),
  unit: text("unit").notNull().default(""),
  condition: text("condition"),
  kw: integer("kw"),
  capacityBand: text("capacity_band"),
  portable: boolean("portable").notNull().default(false),
  fuel: text("fuel"),
  enclosure: text("enclosure"),
  location: text("location"),
  status: text("status"),
  phase: text("phase"),
  built: text("built"),
  volts: text("volts"),
  hours: integer("hours"),
  amps: text("amps"),
  description: text("description"),
  image: text("image"),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Leads / CRM ───────────────────────────────────────────────────────────────
export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  message: text("message"),
  source: text("source").notNull().default("contact"),
  formTitle: text("form_title"),
  page: text("page"),
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Quotes ────────────────────────────────────────────────────────────────────
export interface QuoteUnit {
  slug?: string;
  title: string;
  kw?: number | null;
  fuel?: string | null;
  condition?: string | null;
  unit?: string | null;
}

export const quotes = pgTable("quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  quoteNumber: text("quote_number").notNull().unique(),
  token: text("token").notNull().unique(),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  customerCompany: text("customer_company"),
  units: jsonb("units").$type<QuoteUnit[]>().default([]),
  need: text("need"),
  notes: text("notes"),
  amount: integer("amount").notNull().default(0),
  depositAmount: integer("deposit_amount"),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("draft"),
  leadId: uuid("lead_id"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Payments ──────────────────────────────────────────────────────────────────
export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  quoteId: uuid("quote_id"),
  transactionId: text("transaction_id"),
  authCode: text("auth_code"),
  amount: integer("amount").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("pending"),
  method: text("method").default("card"),
  cardLast4: text("card_last4"),
  cardType: text("card_type"),
  raw: jsonb("raw").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Profiles ──────────────────────────────────────────────────────────────────
export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  auth0Sub: text("auth0_sub").unique(),
  email: text("email").unique(),
  name: text("name"),
  role: text("role").notNull().default("customer"),
  notes: text("notes"),
  lastLogin: timestamp("last_login", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── AI conversations + messages ───────────────────────────────────────────────
export const aiConversations = pgTable("ai_conversations", {
  id: text("id").primaryKey(),
  email: text("email"),
  title: text("title"),
  source: text("source").notNull().default("concierge"),
  messageCount: integer("message_count").notNull().default(0),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const aiMessages = pgTable("ai_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: text("conversation_id").notNull(),
  messageId: text("message_id"),
  role: text("role").notNull(),
  parts: jsonb("parts").$type<unknown[]>().default([]),
  text: text("text"),
  seq: integer("seq").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Agent runs ────────────────────────────────────────────────────────────────
export const agentRuns = pgTable("agent_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: text("kind").notNull().default("code"),
  prompt: text("prompt").notNull(),
  status: text("status").notNull().default("queued"),
  agentId: text("agent_id"),
  branch: text("branch"),
  prNumber: integer("pr_number"),
  prUrl: text("pr_url"),
  previewUrl: text("preview_url"),
  summary: text("summary"),
  error: text("error"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Audit log ─────────────────────────────────────────────────────────────────
export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  actor: text("actor"),
  action: text("action").notNull(),
  target: text("target"),
  details: jsonb("details").$type<Record<string, unknown>>().default({}),
  ip: text("ip"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── Type exports ──────────────────────────────────────────────────────────────
export type PageRow = typeof pages.$inferSelect;
export type PageRevisionRow = typeof pageRevisions.$inferSelect;
export type SiteSettingRow = typeof siteSettings.$inferSelect;
export type ProductRow = typeof products.$inferSelect;
export type LeadRow = typeof leads.$inferSelect;
export type QuoteRow = typeof quotes.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;
export type ProfileRow = typeof profiles.$inferSelect;
export type AiConversationRow = typeof aiConversations.$inferSelect;
export type AiMessageRow = typeof aiMessages.$inferSelect;
export type AgentRunRow = typeof agentRuns.$inferSelect;
export type AuditLogRow = typeof auditLog.$inferSelect;
