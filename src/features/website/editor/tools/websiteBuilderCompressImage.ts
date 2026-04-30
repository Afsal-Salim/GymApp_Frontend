/**
 * Client-side downscale + re-encode before gym image upload (helps stay under 1 MB API limit).
 */
export async function compressImageFileForWebsiteUpload(
  file: File,
  opts?: { maxWidth?: number; maxBytes?: number; quality?: number; mime?: 'image/jpeg' | 'image/webp' },
): Promise<File> {
  const maxW = opts?.maxWidth ?? 1920;
  const maxBytes = opts?.maxBytes ?? 950_000;
  const quality = opts?.quality ?? 0.82;
  const mime = opts?.mime ?? 'image/jpeg';

  if (!file.type.startsWith('image/') || file.size <= maxBytes) {
    return file;
  }

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const w = bitmap.width;
  const h = bitmap.height;
  const scale = w > maxW ? maxW / w : 1;
  const cw = Math.max(1, Math.round(w * scale));
  const ch = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close?.();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, cw, ch);
  try {
    bitmap.close?.();
  } catch {
    /* ignore */
  }

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), mime, quality),
  );
  if (!blob || blob.size >= file.size) {
    return file;
  }

  const base = file.name.replace(/\.[^.]+$/, '') || 'photo';
  const ext = mime === 'image/webp' ? 'webp' : 'jpg';
  return new File([blob], `${base}-web.${ext}`, { type: mime });
}
