import { z } from "zod";
import { ofetch } from "ofetch";
import { createHash } from "node:crypto";

const { YOUDAO_APP_KEY, YOUDAO_KEY } = process.env;

const request_schema = z.object({
  img: z.string(),
});

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

export default defineEventHandler(async (event) => {
  const { img } = await readValidatedBody(event, request_schema.parse);
  const formData = new FormData();
  formData.append("img", img);
  addAuthParams(formData, img);
  formData.append("langType", "auto");
  formData.append("detectType", "10012");
  formData.append("imageType", "1");
  formData.append("docType", "json");
  const { Result } = await ofetch("https://openapi.youdao.com/ocrapi", {
    method: "POST",
    body: formData,
  });
  const { regions } = Result;
  return regions;
});
