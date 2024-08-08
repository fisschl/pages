import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["DASHSCOPE_API_KEY"],
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

export default defineEventHandler(async (event) => {
  const { model, messages } = await readBody(event);
  const stream = await openai.chat.completions.create({
    model: model || "qwen-max",
    messages,
    stream: true,
  });
  const eventStream = createEventStream(event);
  setTimeout(async () => {
    for await (const item of stream) {
      await eventStream.push(JSON.stringify(item));
    }
    await eventStream.close();
  }, 60);
  await eventStream.send();
});
