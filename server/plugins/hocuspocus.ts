import { Hocuspocus } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";

export default defineNitroPlugin(({ hooks }) => {
  hooks.hookOnce("request", async () => {
    const server = new Hocuspocus({
      port: 3010,
      extensions: [
        new Database({
          fetch: async ({ documentName }) => {
            const item = await db.article.findUnique({
              where: { id: documentName },
            });
            if (!item) return null;
            return new Uint8Array(item.body);
          },
          store: async ({ documentName, state }) => {
            await db.article.update({
              where: { id: documentName },
              data: { body: state },
            });
          },
        }),
      ],
      onAuthenticate: async ({ token }) => {
        const user = await getUser(token);
        if (!user) throw new Error("onAuthenticate: Invalid token");
      },
    });
    await server.listen();
  });
});
