import "dotenv/config";
import type { Config } from "drizzle-kit";

const config: Config = {
  schema: "./server/utils/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
};

export default config;