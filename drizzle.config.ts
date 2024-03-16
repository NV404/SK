import type { Config } from "drizzle-kit"

import * as dotenv from "dotenv"
dotenv.config()

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error("Error: DATABASE_URL is required!")
}

export default {
  schema: "./@/db/schema.ts",
  out: "./@/db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: DATABASE_URL,
  },
  tablesFilter: ["saasdata_*"],
} satisfies Config
