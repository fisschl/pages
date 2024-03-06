declare function upload_file(
  key: string,
  file: File,
  progress?: (p: number) => void,
): Promise<void>;

export { upload_file };
