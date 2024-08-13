import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["MOONSHOT_API_KEY"],
  baseURL: "https://api.moonshot.cn/v1",
});

export const runTask = (func: () => unknown) => func();

export default defineEventHandler(async (event) => {
  const { model, messages } = await readBody(event);
  const stream = await openai.chat.completions.create({
    model: model || "moonshot-v1-32k",
    messages,
    stream: true,
  });
  const eventStream = createEventStream(event);
  runTask(async () => {
    for await (const item of stream)
      await eventStream.push(JSON.stringify(item));
    await eventStream.close();
  });
  await eventStream.send();
});
