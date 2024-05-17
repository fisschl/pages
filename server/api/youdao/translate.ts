import { z } from "zod";
import { ofetch } from "ofetch";
import { createHash } from "node:crypto";

const request_schema = z.object({
  text: z.string().optional(),
  image: z.string().optional(),
  from: z.string().default("auto"),
  to: z.string().default("en"),
});

const { YOUDAO_APP_KEY, YOUDAO_KEY } = process.env;

function truncate(text: string) {
  const len = text.length;
  if (len <= 20) return text;
  return text.substring(0, 10) + len + text.substring(len - 10, len);
}

const text_response_schema = z.object({
  translation: z.array(z.string()),
});

export default defineEventHandler(async (event) => {
  const { text, image, from, to } = await readValidatedBody(
    event,
    request_schema.parse,
  );
  if (text) {
    const salt = uuid();
    const time = Math.round(Date.now() / 1000);
    const hash = createHash("sha256");
    hash.update(YOUDAO_APP_KEY + truncate(text) + salt + time + YOUDAO_KEY);
    const formData = new FormData();
    formData.append("q", text);
    formData.append("appKey", YOUDAO_APP_KEY!);
    formData.append("salt", salt);
    formData.append("from", from);
    formData.append("to", to);
    formData.append("sign", hash.digest("hex"));
    formData.append("signType", "v3");
    formData.append("curtime", time.toString());
    const res = await ofetch("https://openapi.youdao.com/api", {
      method: "POST",
      body: formData,
    });
    const data = text_response_schema.parse(res);
    return {
      text: data.translation.join("\n\n"),
    };
  }
});
