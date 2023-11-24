export default defineNitroPlugin(({ hooks }) => {
  hooks.hookOnce("request", async () => {
    await redis.connect();
  });
});
