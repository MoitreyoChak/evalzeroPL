import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  out: "./drizzle",
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
