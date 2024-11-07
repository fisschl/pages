import { first } from "lodash-es";
import OpenAI from "openai";

const TranslatePrompt = `
你是一名翻译助手，精通多种语言和领域的翻译。

接下来，你需要将我提供的文本、图片、文件等内容翻译成中文。请你直接回答翻译结果。

请注意：对于代码块，代码片段，专有名词等内容，不需要翻译，请自动按照相应格式输出。
`;

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
    model: "moonshot-v1-32k",
    client: MoonshotBaseClient,
  },
  {
    model: "qwen-plus",
    client: DashscopeBaseClient,
  },
  {
    model: "gpt-4o",
    client: OpenAIBaseClient,
  },
  {
    model: "gpt-4o-mini",
    client: OpenAIBaseClient,
  },
];

export interface TranslateRequest {
  key?: string;
  text?: string;
  model?: string;
}

export default defineWebSocketHandler({
  async message(peer, message) {
    const request = message.json<TranslateRequest>();
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    messages.push({
      role: "system",
      content: TranslatePrompt,
    });
    const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];
    if (request.text) {
      content.push({
        type: "text",
        text: request.text,
      });
    }
    messages.push({
      role: "user",
      content: content,
    });
    const baseModel =
      models.find((model) => model.model === request.model) || first(models)!;
    const stream = await baseModel.client.chat.completions.create({
      model: baseModel.model,
      messages: messages,
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
    peer.send(
      JSON.stringify({
        key: request.key,
        finished: true,
      }),
    );
  },
});
