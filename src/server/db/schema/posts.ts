import { sql } from "drizzle-orm";
import { index } from "drizzle-orm/pg-core";
import { createTable } from "../utils";
import { users } from "./auth";

export const posts = createTable(
    "post",
    (d) => ({
        id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
        name: d.varchar({ length: 256 }),
        createdById: d
            .varchar({ length: 255 })
            .notNull()
            .references(() => users.id),
        createdAt: d
            .timestamp({ withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    }),
    (t) => [
        index("created_by_idx").on(t.createdById),
        index("name_idx").on(t.name),
    ],
);
