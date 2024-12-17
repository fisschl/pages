import { MoonshotBaseClient } from "~/server/api/translate";
import type OpenAI from "openai";

const NamingPrompt = `
你是一名程序员，你的任务是为一个字段命名。该字段可能指一个变量、函数、类、文件名等。
接下来，我会给你一些描述或提示，请你根据描述的含义给出对应的命名，使用 PascalCase 格式。
你的命名应该尽量简短而有意义。尽量给出多个备选的命名。多个命名之间用逗号分隔。
`;

export interface NamingRequest {
  key?: string;
  text: string;
  case: string;
}

export default defineWebSocketHandler({
  async message(peer, message) {
    const request = message.json<NamingRequest>();
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    messages.push(
      {
        role: "system",
        content: NamingPrompt,
      },
      {
        role: "user",
        content: request.text,
      },
    );
    const stream = await MoonshotBaseClient.chat.completions.create({
      model: "moonshot-v1-8k",
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
          text: result.text,
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
