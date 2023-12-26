import { format } from "prettier";

export default defineEventHandler(async (event) => {
  const { text, filepath, parser, extension } = await readBody(event);
  return format(text, {
    parser,
    filepath: extension ? `file.${extension}` : filepath,
  });
});
