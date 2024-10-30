import { createAuthClient } from "better-auth/vue";

export const authClient = createAuthClient({
  baseURL: "http://localhost:4030", // the base url of your auth server
});

export const { signIn, signUp, useSession } = authClient;
