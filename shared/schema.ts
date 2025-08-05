import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  genre: text("genre").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  currentStep: integer("current_step").notNull().default(1),
  progress: integer("progress").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const characters = pgTable("characters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  personality: text("personality"),
  background: text("background"),
  role: text("role"),
  affiliation: text("affiliation"),
  imageUrl: text("image_url"),
  order: integer("order").notNull().default(0),
});

export const plots = pgTable("plots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  theme: text("theme"),
  setting: text("setting"),
  structure: text("structure").notNull().default("kishotenketsu"), // kishotenketsu or three-act
  hook: text("hook"),
  opening: text("opening"),
  development: text("development"),
  climax: text("climax"),
  conclusion: text("conclusion"),
});

export const synopses = pgTable("synopses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  tone: text("tone"),
  style: text("style"),
});

export const synopsisVersions = pgTable("synopsis_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  version: integer("version").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const chapters = pgTable("chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  summary: text("summary"),
  structure: text("structure").notNull(), // ki, sho, ten, ketsu
  estimatedWords: integer("estimated_words").default(0),
  estimatedReadingTime: integer("estimated_reading_time").default(0),
  characterIds: jsonb("character_ids").default('[]'),
  order: integer("order").notNull(),
});

export const episodes = pgTable("episodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chapterId: varchar("chapter_id").notNull().references(() => chapters.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  perspective: text("perspective"),
  mood: text("mood"),
  events: jsonb("events").default('[]'),
  dialogue: text("dialogue"),
  setting: text("setting"),
  order: integer("order").notNull(),
});

export const drafts = pgTable("drafts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  episodeId: varchar("episode_id").notNull().references(() => episodes.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  tone: text("tone"),
  isGenerated: boolean("is_generated").default(false),
  version: integer("version").notNull().default(1),
});

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
});

export const insertPlotSchema = createInsertSchema(plots).omit({
  id: true,
});

export const insertSynopsisSchema = createInsertSchema(synopses).omit({
  id: true,
});

export const insertChapterSchema = createInsertSchema(chapters).omit({
  id: true,
});

export const insertEpisodeSchema = createInsertSchema(episodes).omit({
  id: true,
});

export const insertDraftSchema = createInsertSchema(drafts).omit({
  id: true,
});

// Types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;

export type Plot = typeof plots.$inferSelect;
export type InsertPlot = z.infer<typeof insertPlotSchema>;

export type Synopsis = typeof synopses.$inferSelect;
export type InsertSynopsis = z.infer<typeof insertSynopsisSchema>;

export type SynopsisVersion = typeof synopsisVersions.$inferSelect;
export const insertSynopsisVersionSchema = createInsertSchema(synopsisVersions).omit({
  id: true,
  createdAt: true,
});
export type InsertSynopsisVersion = z.infer<typeof insertSynopsisVersionSchema>;

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;

export type Episode = typeof episodes.$inferSelect;
export type InsertEpisode = z.infer<typeof insertEpisodeSchema>;

export type Draft = typeof drafts.$inferSelect;
export type InsertDraft = z.infer<typeof insertDraftSchema>;
