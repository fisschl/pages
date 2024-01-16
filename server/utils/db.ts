import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as schema from "./schema";

export const connection = postgres(process.env.DATABASE_URL!);

export const db = drizzle(connection, { schema });

if (process.argv.includes("db:merge")) {
  await migrate(db, { migrationsFolder: "./drizzle" });
}

await connection.end();
