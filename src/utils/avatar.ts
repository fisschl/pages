/**
 * 输入一张图片，并压缩至 256x256
 */
export const inputAvatar = async () => {
  // 选择图片
  const files = await new Promise<FileList | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => resolve(input.files);
    input.click();
  });
  if (!files || !files.length) return;
  const file = files[0];
  // 将文件对象转换为 URL
  const url = await new Promise<string | void>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      if (typeof res !== "string") return resolve();
      resolve(res);
    };
    reader.readAsDataURL(file);
  });
  if (!url) return;
  // 开始压缩图片
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = new Image();
  // 获取图片的原始宽高
  const [naturalWidth, naturalHeight] = await new Promise<[number, number]>(
    (resolve) => {
      img.onload = () => resolve([img.naturalWidth, img.naturalHeight]);
      img.src = url;
    },
  );
  // 计算裁剪的起始坐标和裁剪宽高
  // 以最小边为基准，裁剪出正方形
  const width = Math.min(naturalWidth, naturalHeight);
  // 裁剪的起始坐标，以图片中心为基准
  const sx = (naturalWidth - width) / 2;
  const sy = (naturalHeight - width) / 2;
  // 设置 canvas 的宽高为要压缩至的宽高
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(img, sx, sy, width, width, 0, 0, size, size);
  return canvas.toDataURL("image/webp");
};
