import { ExifTool } from 'exiftool-vendored';

let exiftool: ExifTool | null = null;

function getExifTool(): ExifTool {
  if (!exiftool) {
    exiftool = new ExifTool({ useMWG: true });
  }
  return exiftool;
}

export async function closeExifTool(): Promise<void> {
  if (exiftool) {
    await exiftool.end();
    exiftool = null;
  }
}

export interface ExifData {
  cameraMake: string | null;
  cameraModel: string | null;
  fStop: number | null;
  exposureTime: string | null;
  iso: number | null;
  exposureBias: number | null;
  focalLength: number | null;
  focalLength35mm: number | null;
  maxAperture: number | null;
  meteringMode: string | null;
  flash: string | null;
}

export interface PhotoMetadata {
  takenAt: string | null;
  tags: string[];
  description: string | null;
  exif: ExifData | null;
}

function formatExposureTime(value: number | undefined): string | null {
  if (!value) return null;
  if (value >= 1) return `${value} sec.`;
  const denominator = Math.round(1 / value);
  return `1/${denominator} sec.`;
}

export async function readMetadata(imagePath: string): Promise<PhotoMetadata> {
  const et = getExifTool();
  const tags = await et.read(imagePath);

  let takenAt: string | null = null;
  if (tags.DateTimeOriginal) {
    const dt = tags.DateTimeOriginal;
    if (typeof dt === 'object' && 'toISOString' in dt) {
      takenAt = (dt as { toISOString(): string }).toISOString();
    } else if (typeof dt === 'string') {
      takenAt = new Date(dt).toISOString();
    }
  }

  let keywords: string[] = [];
  if (tags.Keywords) {
    keywords = Array.isArray(tags.Keywords)
      ? tags.Keywords
      : [tags.Keywords as string];
  }

  const description = (tags.Description as string) || null;

  const exif: ExifData = {
    cameraMake: (tags.Make as string) || null,
    cameraModel: (tags.Model as string) || null,
    fStop: (tags.FNumber as number) || null,
    exposureTime: formatExposureTime(tags.ExposureTime as number | undefined),
    iso: (tags.ISO as number) || null,
    exposureBias: tags.ExposureCompensation !== undefined ? (tags.ExposureCompensation as number) : null,
    focalLength: (tags.FocalLength as number) || null,
    focalLength35mm: (tags.FocalLengthIn35mmFormat as number) || null,
    maxAperture: (tags.MaxApertureValue as number) || null,
    meteringMode: (tags.MeteringMode as string) || null,
    flash: (tags.Flash as string) || null,
  };

  const hasExifData = Object.values(exif).some((v) => v !== null);

  return { takenAt, tags: keywords, description, exif: hasExifData ? exif : null };
}

export async function writeMetadata(
  imagePath: string,
  updates: { tags?: string[]; description?: string | null }
): Promise<void> {
  const et = getExifTool();
  const writeArgs: Record<string, unknown> = {};

  if (updates.tags !== undefined) {
    writeArgs['Keywords'] = updates.tags;
  }

  if (updates.description !== undefined) {
    writeArgs['Description'] = updates.description || '';
  }

  await et.write(imagePath, writeArgs, ['-overwrite_original']);
}

export async function setHeroTag(
  allImagePaths: string[],
  heroImagePath: string
): Promise<void> {
  for (const imagePath of allImagePaths) {
    const metadata = await readMetadata(imagePath);
    const hasHero = metadata.tags.includes('_hero');

    if (imagePath === heroImagePath) {
      if (!hasHero) {
        await writeMetadata(imagePath, { tags: [...metadata.tags, '_hero'] });
      }
    } else if (hasHero) {
      await writeMetadata(imagePath, {
        tags: metadata.tags.filter((t) => t !== '_hero'),
      });
    }
  }
}
