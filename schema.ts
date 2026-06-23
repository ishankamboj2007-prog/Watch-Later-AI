import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories for organizing videos (e.g., Programming, Science, Business)
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).default("#3B82F6").notNull(), // Hex color
  description: text("description"),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Videos in user's library
 */
export const videos = mysqlTable("videos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  youtubeId: varchar("youtubeId", { length: 20 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  channelName: varchar("channelName", { length: 255 }),
  channelUrl: varchar("channelUrl", { length: 500 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  duration: int("duration"), // Duration in seconds
  youtubeUrl: varchar("youtubeUrl", { length: 500 }).notNull(),
  watched: boolean("watched").default(false).notNull(),
  watchStatus: mysqlEnum("watchStatus", ["unwatched", "in_progress", "watched"]).default("unwatched").notNull(),
  aiSummary: text("aiSummary"),
  categoryId: int("categoryId"),
  userNotes: text("userNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;

/**
 * Tags for additional metadata on videos
 */
export const videoTags = mysqlTable("videoTags", {
  id: int("id").autoincrement().primaryKey(),
  videoId: int("videoId").notNull(),
  tag: varchar("tag", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VideoTag = typeof videoTags.$inferSelect;
export type InsertVideoTag = typeof videoTags.$inferInsert;

/**
 * Tracking for periodic digest notifications
 */
export const digestNotifications = mysqlTable("digestNotifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lastSentAt: timestamp("lastSentAt"),
  videosIncluded: json("videosIncluded").$type<number[]>().default([]).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DigestNotification = typeof digestNotifications.$inferSelect;
export type InsertDigestNotification = typeof digestNotifications.$inferInsert;

/**
 * User preferences and settings
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  viewMode: mysqlEnum("viewMode", ["grid", "list"]).default("grid").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Mood/Intent-based filtering for videos
 */
export const videoMoods = mysqlTable("videoMoods", {
  id: int("id").autoincrement().primaryKey(),
  videoId: int("videoId").notNull(),
  mood: mysqlEnum("mood", ["learn", "entertainment", "quick_watch", "deep_dive", "revisit_later"]).notNull(),
  score: int("score").default(50).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VideoMood = typeof videoMoods.$inferSelect;
export type InsertVideoMood = typeof videoMoods.$inferInsert;

/**
 * Collections/Playlists for organizing videos
 */
export const collections = mysqlTable("collections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#8B5CF6").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = typeof collections.$inferInsert;

/**
 * Videos in collections (many-to-many)
 */
export const collectionVideos = mysqlTable("collectionVideos", {
  id: int("id").autoincrement().primaryKey(),
  collectionId: int("collectionId").notNull(),
  videoId: int("videoId").notNull(),
  position: int("position").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CollectionVideo = typeof collectionVideos.$inferSelect;
export type InsertCollectionVideo = typeof collectionVideos.$inferInsert;

/**
 * Public share links for videos
 */
export const shareLinks = mysqlTable("shareLinks", {
  id: int("id").autoincrement().primaryKey(),
  videoId: int("videoId").notNull(),
  userId: int("userId").notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ShareLink = typeof shareLinks.$inferSelect;
export type InsertShareLink = typeof shareLinks.$inferInsert;