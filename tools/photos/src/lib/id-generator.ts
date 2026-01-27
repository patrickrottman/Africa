import sharp from 'sharp';
import { createHash } from 'crypto';

export async function generateStableId(imagePath: string): Promise<string> {
  const image = sharp(imagePath);
  const buffer = await image
    .rotate()
    .resize(64, 64, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer();

  const hash = createHash('sha256').update(buffer).digest('hex');
  return hash.substring(0, 20);
}
