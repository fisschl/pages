export default defineNitroPlugin(async () => {
  redis.connect();
});
