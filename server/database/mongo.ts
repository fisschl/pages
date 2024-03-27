import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(process.env.MONGODB_URL!);
export const mongodb = mongoClient.db("default");
