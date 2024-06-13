import { z } from "zod";
import { parseMarkdown } from "~/server/api/markdown";
import { publisher } from "~/server/database/mqtt";
import { useToken } from "~/server/utils/user";
import { writeLog } from "~/server/database/clickhouse";
import { EventSourceParserStream } from "eventsource-parser/stream";
import destr from "destr";

const request_schema = z.object({
  content: z.string(),
});

const dashscopeSchema = z.object({
  output: z.object({
    text: z.string(),
  }),
});

const { TRANSLATION_API_ID, TRANSLATION_API_KEY } = process.env;

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, request_schema.parse);
  try {
    const response = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/apps/${TRANSLATION_API_ID}/completion`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TRANSLATION_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          input: {
            prompt: body.content,
          },
        }),
      },
    );
    const stream = response.body
      ?.pipeThrough(new TextDecoderStream())
      .pipeThrough(new EventSourceParserStream())
      .getReader();
    if (!stream) throw createError({ status: 500 });
    const token = useToken(event);
    while (true) {
      const { value, done } = await stream.read();
      if (done) break;
      if (!value) continue;
      const res = dashscopeSchema.safeParse(destr(value.data));
      if (!res.success) continue;
      const { text } = res.data.output;
      const message = {
        content: await parseMarkdown(text),
      };
      publisher.publish(`public/translate/${token}`, JSON.stringify(message));
    }
    return { message: "完成" };
  } catch (e) {
    const content = JSON.stringify({
      error: e,
      content: body.content,
    });
    await writeLog("请求翻译失败", content);
    throw createError({ status: 500 });
  }
});
