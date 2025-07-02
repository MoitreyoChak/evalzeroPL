import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  foreignKey,
  boolean,
  unique,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  email: text().notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  avatar: text(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).defaultNow(),
});

export const accountsTable = pgTable(
  "accounts",
  {
    providerId: text("provider_id").notNull(),
    provider: text().notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    userId: uuid("user_id").notNull(),
    id: uuid().defaultRandom().primaryKey().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
      name: "accounts_userId_fkey",
    })
      .onUpdate("restrict")
      .onDelete("cascade"),
  ]
);

export const basicAuthTable = pgTable(
  "basic_auth",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    password: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersTable.id],
      name: "basic_auth_user_id_fkey",
    })
      .onUpdate("restrict")
      .onDelete("cascade"),
    unique("basic_auth_user_id_key").on(table.userId),
  ]
);
