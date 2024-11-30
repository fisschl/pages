import { createAuthClient } from "better-auth/vue";
import { passkeyClient, usernameClient } from "better-auth/client/plugins";

const client = createAuthClient({
  plugins: [passkeyClient(), usernameClient()],
});

export const { signIn, signUp } = client;

export const useSession = () => client.useSession(useFetch);
