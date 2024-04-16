import { z } from "zod";
import { checkUser } from "../auth/index.post";
import { table_collection } from "./index.post";
import { ObjectId } from "mongodb";
import { omit } from "lodash-es";

const request_schema = z.object({
  _id: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const body = await readBody(event);
  const { _id } = request_schema.parse(body);
  await table_collection.updateOne(
    { _id: new ObjectId(_id), user_id: user.id },
    { $set: omit(body, ["_id"]) },
  );
});
