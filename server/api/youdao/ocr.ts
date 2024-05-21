import { z } from "zod";
import { ofetch } from "ofetch";
import { addAuthParams } from "~/server/api/youdao/translate";

const request_schema = z.object({
  img: z.string(),
});

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
