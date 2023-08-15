import { ofetch } from "ofetch";

export const request = ofetch.create({
  baseURL: "https://fisschl.world/api",
  onRequest: (config) => {
    const headers = new Headers(config.options.headers);
    headers.set("Authorization", localStorage.getItem("token") || "");
    config.options.headers = headers;
  },
});

/**
 * 分页
 */
export interface Page {
  page: number; // 当前页码
  size: number; // 每页的记录数
}

export const pageLength = (total: number, size: number) => {
  return Math.ceil(total / size);
};
