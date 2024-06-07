import OpenAI from "openai";
import { z } from "zod";
import { parseMarkdown } from "~/server/api/markdown";
import { publisher } from "~/server/database/mqtt";
import { useToken } from "~/server/utils/user";

const zh_prompt = `
你是一个专业翻译引擎，你擅长将任何语言翻译为中文。你会完整，确切，优雅，易于理解地翻译我的话，尽量保证信达雅。仅需给出翻译，无需解释。
`;

export const openai = new OpenAI({
  apiKey: process.env["MOONSHOT_API_KEY"],
  baseURL: "https://api.moonshot.cn/v1",
});

const request_schema = z.object({
  content: z.string(),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, request_schema.parse);
  body.content = body.content.replace(/\n+/g, "\n\n");
  const stream = await openai.chat.completions.create({
    model: "moonshot-v1-8k",
    messages: [
      {
        role: "system",
        content: zh_prompt,
      },
      {
        role: "user",
        content: body.content,
      },
    ],
    stream: true,
    max_tokens: 2048,
  });
  const output = {
    content: "",
  };
  const token = useToken(event);
  for await (const { choices } of stream) {
    if (!choices.length) continue;
    const [{ delta }] = choices;
    if (!delta || !delta.content) continue;
    output.content += delta.content;
    const message = {
      ...output,
      content: await parseMarkdown(output.content),
    };
    publisher.publish(`public/translate/${token}`, JSON.stringify(message));
  }
  return output;
});
