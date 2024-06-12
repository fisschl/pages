import { z } from "zod";
import { OPENAI_MODEL } from "~/server/api/chat/send";
import { database } from "~/server/database/postgres";
import { use401 } from "~/server/utils/user";
import { parseMarkdown } from "../markdown";
import { groupBy } from "lodash-es";

const request_schema = z.object({
  time: z
    .string()
    .datetime()
    .catch(() => new Date().toISOString()),
});

export type MessagesQuery = z.input<typeof request_schema>;

export default defineEventHandler(async (event) => {
  const user = await use401(event);
  const { time } = await getValidatedQuery(event, request_schema.parse);
  const history = await database.message_ai_chat.findMany({
    where: {
      user_id: user,
      time: { lt: time },
    },
    orderBy: { time: "desc" },
    take: 16,
  });
  const images = await database.message_ai_image.findMany({
    where: {
      message_id: { in: history.map((item) => item.message_id) },
    },
  });
  const image_group = groupBy(images, "message_id");
  history.reverse();
  const list = history.map(async (item) => {
    return {
      ...item,
      images: image_group[item.message_id] || [],
      content: await parseMarkdown(item.content),
    };
  });
  return {
    list: await Promise.all(list),
    model: OPENAI_MODEL,
  };
});
