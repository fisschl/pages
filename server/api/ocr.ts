import { MoonshotBaseClient } from "~/server/api/translate";
import type OpenAI from "openai";
import { parseMarkdown } from "~/server/utils/markdown";

export interface OCRRequest {
  key?: string;
  image_url: string;
}

export default defineWebSocketHandler({
  async message(peer, message) {
    const request = message.json<OCRRequest>();
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    messages.push({
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: {
            url: request.image_url,
          },
        },
        { type: "text", text: "请详细输出图片中的文字内容" },
      ],
    });
    const stream = await MoonshotBaseClient.chat.completions.create({
      model: "qwen-vl-max-latest",
      messages,
      stream: true,
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
