import { sql } from "drizzle-orm";
import { index } from "drizzle-orm/pg-core";
import { createTable } from "../utils";
import { User } from "./auth";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const Post = createTable(
    "post",
    (d) => ({
        id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
        title: d.varchar({ length: 256 }).notNull(),
        content: d.text().notNull(),
        createdById: d
            .varchar({ length: 255 })
            .notNull()
            .references(() => User.id),
        createdAt: d
            .timestamp({ withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    }),
    (t) => [
        index("created_by_idx").on(t.createdById),
        index("name_idx").on(t.title),
    ],
);

export const CreatePostSchema = createInsertSchema(Post, {
    title: z.string().max(256),
    content: z.string().max(256),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
