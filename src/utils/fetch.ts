import { ofetch } from "ofetch";

export const request = ofetch.create({
  baseURL: "https://fisschl.world/api",
  onRequest: (config) => {
    const headers: any = config.options.headers || {};
    headers["Authorization"] = localStorage.getItem("token");
    config.options.headers = headers;
  },
});
