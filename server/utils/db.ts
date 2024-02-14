import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { TypeOf, z } from "zod";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import { MongoClient } from "mongodb";

export const connection = postgres(process.env.DATABASE_URL!);

export const db = drizzle(connection, { schema });

export const PageQuerySchema = z.object({
  page: z.string().default("1"),
  pageSize: z.string().default("64"),
});

export const limitOffset = (page: TypeOf<typeof PageQuerySchema>) => {
  return {
    limit: +page.pageSize,
    offset: (+page.page - 1) * +page.pageSize,
  };
};

const { window } = new JSDOM();
const purify = DOMPurify(window);

export const sanitize = (html: string) => {
  return purify.sanitize(html);
};

const mongoClient = new MongoClient(process.env.MONGODB_URL!);
export const mongodb = mongoClient.db("default");
