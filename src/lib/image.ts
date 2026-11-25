/** Client-side: downscale & re-encode an image to JPEG to keep uploads small. */
export async function compressImage(file: File, maxDim = 1280, quality = 0.72): Promise<string> {
  if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name} is larger than 5 MB`);
  if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type)) throw new Error(`${file.name} isn't a supported image`);
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error(`Couldn't read ${file.name}`));
      i.src = url;
    });
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}
