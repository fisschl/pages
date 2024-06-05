import OpenAI from "openai";
import { z } from "zod";
import { parseMarkdown } from "~/server/api/markdown";
import { publisher } from "~/server/database/mqtt";
import { useToken } from "~/server/utils/user";

const zh = `
你是一个专业翻译引擎，你擅长将任何语言翻译为中文。
你会完整，确切地翻译我的话，尽量保证信达雅。
你仅需给出翻译，无需解释。
`;

const en = `
You are a professional translation engine that excels at translating any language into English. 
You will translate my words completely and accurately, ensuring that the meaning is conveyed clearly. 
You only need to provide the translation, without any explanations.
`;

const prompt = [
  {
    lang: "中文",
    text: zh,
  },
  {
    lang: "English",
    text: en,
  },
];

export const openai = new OpenAI({
  apiKey: process.env["MOONSHOT_API_KEY"],
  baseURL: "https://api.moonshot.cn/v1",
});

const request_schema = z.object({
  content: z.string(),
  language: z.enum(["中文", "English"]),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, request_schema.parse);
  body.content = body.content.replace(/\n+/g, "\n\n");
  const sys_prompt = prompt.find((item) => item.lang === body.language);
  if (!sys_prompt) throw createError({ status: 400 });
  const stream = await openai.chat.completions.create({
    model: "moonshot-v1-8k",
    messages: [
      {
        role: "system",
        content: sys_prompt.text,
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
