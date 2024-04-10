import * as dotenv from "dotenv"
import type { Config } from "drizzle-kit"

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
  tablesFilter: ["saaskart_*"],
} satisfies Config
