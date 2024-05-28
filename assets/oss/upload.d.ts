declare module "./upload" {
  export const upload_file: (
    key: string,
    file: File,
    progress?: (p: number) => void,
  ) => Promise<void>;
}
