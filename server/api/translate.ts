import process from "node:process";
import { first } from "lodash-es";
import OpenAI from "openai";
import { htmlToMarkdown } from "../utils/markdown";

const TranslatePromptChinese = `
你是一名翻译助手，精通多种语言和领域的翻译。
你不会回答我的问题，也不会响应我的其他请求，仅仅只是翻译。
接下来，你需要将我提供的内容翻译成中文。请你直接回答翻译结果。
对于代码块，代码片段，专有名词等内容，不需要翻译，请自动按照相应格式输出。
`;

const TranslatePromptEnglish = `
You are a translation assistant, proficient in multiple languages and specialized in various fields of translation.
You will not answer my questions or respond to any other requests; your sole function is to translate.
Next, you need to translate the content I provide into English. Please respond directly with the translation results.
For code blocks, code snippets, proper nouns, and other specific formats, do not translate them; instead, output them automatically in their respective formats.
`;

const LanguageOptions: Record<string, string> = {
  zh: TranslatePromptChinese,
  en: TranslatePromptEnglish,
};

export const MoonshotBaseClient = new OpenAI({
  apiKey: process.env.MOONSHOT_API_KEY,
  baseURL: "https://api.moonshot.cn/v1",
});

export const OpenAIBaseClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_PROXY_URL,
});

export const DashscopeBaseClient = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

export const models = [
  {
    model: "moonshot-v1-8k",
    client: MoonshotBaseClient,
  },
  {
    model: "qwen-max",
    client: DashscopeBaseClient,
  },
  {
    model: "gpt-4o-mini",
    client: OpenAIBaseClient,
  },
  {
    model: "gpt-4o",
    client: OpenAIBaseClient,
  },
];

export interface TranslateRequest {
  key?: string;
  language?: string;
  text?: string;
  model?: string;
  files?: string[];
}

export default defineWebSocketHandler({
  async message(peer, message) {
    const request = message.json<TranslateRequest>();
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    messages.push({
      role: "system",
      content:
        LanguageOptions[request.language || "zh"] || TranslatePromptChinese,
    });
    const textContents: string[] = [await htmlToMarkdown(request.text)];
    if (request.files) {
      for (const id of request.files) {
        const result = await MoonshotBaseClient.files
          .content(id)
          .then((res) => res.json());
        textContents.push(result.content);
      }
    }
    const text = textContents.join("\n\n").trim();
    const finish = () => {
      peer.send(
        JSON.stringify({
          key: request.key,
          finished: true,
        }),
      );
    };
    if (!text) return finish();
    messages.push({
      role: "user",
      content: text,
    });
    const baseModel =
      models.find((model) => model.model === request.model) || first(models)!;
    const stream = await baseModel.client.chat.completions.create({
      model: baseModel.model,
      messages,
      stream: true,
      max_tokens: 2048,
      max_completion_tokens: 2048,
    });
    const result = {
      text: "",
    };
    for await (const { choices } of stream) {
      if (!choices.length) continue;
      const [{ delta }] = choices;
      if (!delta.content) continue;
      result.text += delta.content;
      peer.send(
        JSON.stringify({
          key: request.key,
          text: await parseMarkdown(result.text),
        }),
      );
    }
    return finish();
  },
});
