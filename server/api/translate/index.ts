import OpenAI from "openai";
import { z } from "zod";
import { parseMarkdown } from "~/server/api/markdown";
import { publisher } from "~/server/database/mqtt";
import { useToken } from "~/server/utils/user";

const zh = `
你是一个专业翻译引擎，你擅长将任何语言翻译为中文，请翻译我给出的文本，只需要翻译不需要解释。
翻译时请注意：
1. 如果我给你的文本是一个句子、段落或文章，请完整、确切地翻译，尽量保证信达雅。
2. 如果我给你的文本仅包含一个词汇或短语，请给出这个词的所有含义（含词性）、双语示例、以及至少三条例句。如果你认为单词拼写错误，请提示我最可能的正确拼写。
`;

const en = `
You are a professional translation engine that excels at translating any language into English.
Please translate the text I have provided without explanation.
Please note when translating:
1. If the text I give you is a sentence, paragraph, or article, please translate it completely and accurately, and try to ensure faithfulness, expressiveness, and elegance.
2. If the text I am giving you only contains one word or phrase, please provide all its meanings, synonyms, bilingual examples, and at least three example sentences.
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
