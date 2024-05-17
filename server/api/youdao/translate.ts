import { z } from "zod";
import { ofetch } from "ofetch";
import { createHash } from "node:crypto";

const request_schema = z.object({
  text: z.string(),
  from: z.string().default("auto"),
  to: z.string().default("zh-CHS"),
});

const { YOUDAO_APP_KEY, YOUDAO_KEY } = process.env;

const truncate = (text: string) => {
  const len = text.length;
  if (len <= 20) return text;
  return text.substring(0, 10) + len + text.substring(len - 10, len);
};

export const addAuthParams = (formData: FormData, input: string) => {
  const salt = uuid();
  const time = Math.round(Date.now() / 1000);
  const hash = createHash("sha256");
  hash.update(YOUDAO_APP_KEY + truncate(input) + salt + time + YOUDAO_KEY);
  formData.append("salt", salt);
  formData.append("appKey", YOUDAO_APP_KEY!);
  formData.append("sign", hash.digest("hex"));
  formData.append("signType", "v3");
  formData.append("curtime", time.toString());
};

const text_response_schema = z.object({
  translation: z.array(z.string()),
});

export default defineEventHandler(async (event) => {
  const { text, from, to } = await readValidatedBody(
    event,
    request_schema.parse,
  );
  const formData = new FormData();
  formData.append("q", text);
  addAuthParams(formData, text);
  formData.append("from", from);
  formData.append("to", to);
  const res = await ofetch("https://openapi.youdao.com/api", {
    method: "POST",
    body: formData,
  });
  const data = text_response_schema.parse(res);
  return { text: data.translation.join("\n\n") };
});
