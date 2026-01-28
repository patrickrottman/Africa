import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { Variant, VariantSet } from '@africa/shared';

interface SizeConfig {
  name: 'thumb' | 'medium' | 'large';
  longEdge: number;
}

const SIZES: SizeConfig[] = [
  { name: 'thumb', longEdge: 400 },
  { name: 'medium', longEdge: 1400 },
  { name: 'large', longEdge: 2560 },
];

const GENERATED_PATH = 'apps/public/src/assets/photos/generated';

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function getFileSize(filePath: string): Promise<number> {
  const stat = await fs.stat(filePath);
  return stat.size;
}

async function analyzeImage(sourcePath: string): Promise<{ brightness: number; isUnderexposed: boolean }> {
  const stats = await sharp(sourcePath).stats();
  const avgBrightness = stats.channels.reduce((sum, ch) => sum + ch.mean, 0) / stats.channels.length;
  const brightness = avgBrightness / 255;
  return {
    brightness,
    isUnderexposed: brightness < 0.35,
  };
}

export async function generateDerivatives(
  sourcePath: string,
  id: string,
  baseDir: string
): Promise<{ variants: VariantSet; width: number; height: number }> {
  const image = sharp(sourcePath);
  const metadata = await image.metadata();
  const originalWidth = metadata.width!;
  const originalHeight = metadata.height!;

  const analysis = await analyzeImage(sourcePath);

  const gammaOut = analysis.isUnderexposed ? 3.0 : 2.2;
  const brightnessBoost = analysis.isUnderexposed ? 1.2 : 1.0;

  if (analysis.isUnderexposed) {
    console.log(`    [DARK IMAGE: brightness=${(analysis.brightness * 100).toFixed(0)}% - applying shadow boost]`);
  }

  const variants: Partial<VariantSet> = {};

  for (const size of SIZES) {
    const sizeDir = path.join(baseDir, GENERATED_PATH, size.name);
    await ensureDir(sizeDir);

    const isLandscape = originalWidth >= originalHeight;
    const targetWidth = isLandscape ? size.longEdge : Math.round((size.longEdge * originalWidth) / originalHeight);
    const targetHeight = isLandscape ? Math.round((size.longEdge * originalHeight) / originalWidth) : size.longEdge;

    const enhanced = sharp(sourcePath)
      .rotate()
      .resize(targetWidth, targetHeight, { fit: 'inside' })
      .gamma(2.2, gammaOut)
      .normalise()
      .sharpen({ sigma: 0.5 })
      .modulate({ saturation: 1.1, brightness: brightnessBoost });

    const avifPath = path.join(sizeDir, `${id}.avif`);
    const webpPath = path.join(sizeDir, `${id}.webp`);
    const jpgPath = path.join(sizeDir, `${id}.jpg`);

    await Promise.all([
      enhanced.clone().avif({ quality: 70 }).toFile(avifPath),
      enhanced.clone().webp({ quality: 80 }).toFile(webpPath),
      enhanced.clone().jpeg({ quality: 85, progressive: true }).toFile(jpgPath),
    ]);

    const [avifBytes, webpBytes, jpgBytes] = await Promise.all([
      getFileSize(avifPath),
      getFileSize(webpPath),
      getFileSize(jpgPath),
    ]);

    const jpgMeta = await sharp(jpgPath).metadata();

    variants[size.name] = {
      avifUrl: `assets/photos/generated/${size.name}/${id}.avif`,
      webpUrl: `assets/photos/generated/${size.name}/${id}.webp`,
      jpgUrl: `assets/photos/generated/${size.name}/${id}.jpg`,
      width: jpgMeta.width!,
      height: jpgMeta.height!,
      bytes: Math.min(avifBytes, webpBytes, jpgBytes),
    };
  }

  return {
    variants: variants as VariantSet,
    width: originalWidth,
    height: originalHeight,
  };
}

export async function cleanupStaleFiles(
  validIds: Set<string>,
  baseDir: string
): Promise<void> {
  for (const size of SIZES) {
    const sizeDir = path.join(baseDir, GENERATED_PATH, size.name);
    try {
      const files = await fs.readdir(sizeDir);
      for (const file of files) {
        const id = path.basename(file, path.extname(file));
        if (!validIds.has(id)) {
          await fs.unlink(path.join(sizeDir, file));
        }
      }
    } catch {
    }
  }

}
