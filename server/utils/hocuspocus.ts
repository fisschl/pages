import { Hocuspocus } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";

const server = new Hocuspocus({
  port: 3010,
  extensions: [
    new Database({
      fetch: async ({ documentName }) => {
        const item = await prisma.article.findUnique({
          where: { id: documentName },
        });
        if (!item) return null;
        return new Uint8Array(item.body);
      },
      store: async ({ documentName, state }) => {
        await prisma.article.update({
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

server.listen();
