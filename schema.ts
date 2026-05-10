import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
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

export const GAME_CATEGORIES = [
  "Action",
  "Puzzle",
  "RPG",
  "Arcade",
  "Aventure",
  "Sport",
  "Plateforme",
  "Simulation",
  "Autre",
] as const;

export type GameCategory = (typeof GAME_CATEGORIES)[number];

export const games = mysqlTable("games", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  coverUrl: text("coverUrl"),
  coverKey: text("coverKey"),
  fileUrl: text("fileUrl"),
  fileKey: text("fileKey"),
  fileType: varchar("fileType", { length: 32 }), // 'html' | 'zip'
  playUrl: text("playUrl"), // URL to serve the playable game
  category: varchar("category", { length: 64 }).default("Autre").notNull(),
  tags: text("tags"), // JSON array stored as string
  authorId: int("authorId").notNull(),
  views: bigint("views", { mode: "number" }).default(0).notNull(),
  downloads: bigint("downloads", { mode: "number" }).default(0).notNull(),
  published: mysqlEnum("published", ["draft", "published"]).default("published").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Game = typeof games.$inferSelect;
export type InsertGame = typeof games.$inferInsert;

export const screenshots = mysqlTable("screenshots", {
  id: int("id").autoincrement().primaryKey(),
  gameId: int("gameId").notNull(),
  url: text("url").notNull(),
  storageKey: text("storageKey"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Screenshot = typeof screenshots.$inferSelect;
export type InsertScreenshot = typeof screenshots.$inferInsert;

export const userDownloads = mysqlTable("user_downloads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  gameId: int("gameId").notNull(),
  downloadedAt: timestamp("downloadedAt").defaultNow().notNull(),
});

export type UserDownload = typeof userDownloads.$inferSelect;
export type InsertUserDownload = typeof userDownloads.$inferInsert;
