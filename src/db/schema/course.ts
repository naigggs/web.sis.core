import { uuidv7 } from "uuidv7"
import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const course = pgTable("courses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => `${uuidv7()}`),

  code: text("code").unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),

  // Audit fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
