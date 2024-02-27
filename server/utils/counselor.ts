import { ofetch } from "ofetch";

export const counselor = ofetch.create({
  baseURL: process.env.COUNSELOR_HOST,
});
