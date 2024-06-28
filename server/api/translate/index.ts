import { z } from "zod";
import { parseMarkdown } from "~/server/utils/markdown";
import { publish } from "~/server/database/mqtt";
import { useToken } from "~/server/utils/user";
import { EventSourceParserStream } from "eventsource-parser/stream";
import destr from "destr";
import { redis } from "~/server/database/redis";
import { consola } from "consola";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import { ulid } from "ulid";

const html2markdown = async (html: string) => {
  const file = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeRemark)
    .use(remarkGfm)
    .use(remarkStringify)
    .process(html);
  return file.toString();
};

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
  const token = useToken(event);
  const reqId = ulid();
  await redis.hset(token, "translate_api", reqId);
  const markdown = await html2markdown(body.content);
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
            prompt: markdown,
          },
        }),
      },
    );
    const stream = response
      .body!.pipeThrough(new TextDecoderStream())
      .pipeThrough(new EventSourceParserStream())
      .getReader();
    while (true) {
      const nowId = await redis.hget(token, "translate_api");
      if (nowId !== reqId) return { message: "已停止" };
      const { value, done } = await stream.read();
      if (done) break;
      if (!value) continue;
      const res = dashscopeSchema.safeParse(destr(value.data));
      if (!res.success) continue;
      const { text } = res.data.output;
      const message = {
        content: await parseMarkdown(text),
      };
      publish(`public/translate/${token}`, message);
    }
    return { message: "完成", content: body.content, markdown };
  } catch (e) {
    consola.error(e);
    const info = JSON.stringify({
      error: e,
      content: body.content,
    });
    consola.error("请求翻译失败", info);
    throw createError({ status: 500 });
  }
});
