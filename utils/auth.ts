import { betterAuth } from "better-auth";
import pg from "pg";
import { passkey, username } from "better-auth/plugins";

const { AUTH_DATABASE_URL } = process.env;
const { Pool } = pg;

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: new Pool({
    connectionString: AUTH_DATABASE_URL,
  }),
  plugins: [username(), passkey()],
});
