import prettier from "prettier";

export default defineEventHandler(async (event) => {
  const { text, filepath, parser } = await readBody(event);
  return prettier.format(text, { parser, filepath });
});
