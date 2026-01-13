// Server-side image preprocessing with Sharp
// Only import this file in API routes or server components

export async function preprocessImageServer(
  buffer: Buffer
): Promise<Buffer> {
  // Dynamic import to ensure this is only used server-side
  const sharp = (await import("sharp")).default;

  return await sharp(buffer)
    .resize(1600, null, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .grayscale()
    .normalize()
    .sharpen()
    .jpeg({ quality: 85 })
    .toBuffer();
}
