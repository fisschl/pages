import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const { OPENAI_API_KEY, OPENAI_PROXY_URL } = process.env;

export const openai = createOpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_PROXY_URL,
});

export default defineEventHandler(async (event) => {
  const { messages } = await readBody(event);
  const { OPENAI_MODEL } = process.env;
  if (!OPENAI_MODEL) throw new Error("Missing OpenAI model");
  const result = streamText({
    model: openai(OPENAI_MODEL),
    messages,
  });
  return result.toDataStreamResponse();
});
