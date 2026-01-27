import * as fs from 'fs/promises';
import * as path from 'path';
import type { Photo, Manifest } from '@africa/shared';
import { generateStableId } from './lib/id-generator';
import { generateDerivatives, cleanupStaleFiles } from './lib/derivative-generator';
import { generateBlurhash } from './lib/blurhash-generator';
import { readMetadata, closeExifTool } from './lib/metadata-reader';

const SOURCE_DIR = 'photos/original';
const MANIFEST_PATH = 'apps/public/src/assets/photos/manifest.json';

async function getExistingManifest(baseDir: string): Promise<Manifest | null> {
  try {
    const content = await fs.readFile(path.join(baseDir, MANIFEST_PATH), 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function sync(): Promise<void> {
  const baseDir = process.cwd();
  const sourceDir = path.join(baseDir, SOURCE_DIR);

  let files: string[];
  try {
    files = await fs.readdir(sourceDir);
  } catch {
    console.log('No photos/original directory found. Creating it...');
    await fs.mkdir(sourceDir, { recursive: true });
    files = [];
  }

  const jpgFiles = files.filter((f) => /\.(jpg|jpeg)$/i.test(f));
  console.log(`Found ${jpgFiles.length} JPEG files in ${SOURCE_DIR}`);

  if (jpgFiles.length === 0) {
    console.log('No photos to process. Add JPEGs to photos/original/ and run again.');
    const manifest: Manifest = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      photos: [],
      tagIndex: {},
    };
    await fs.mkdir(path.dirname(path.join(baseDir, MANIFEST_PATH)), { recursive: true });
    await fs.writeFile(
      path.join(baseDir, MANIFEST_PATH),
      JSON.stringify(manifest, Object.keys(manifest).sort(), 2)
    );
    return;
  }

  const existingManifest = await getExistingManifest(baseDir);
  const existingPhotosById = new Map<string, Photo>();
  if (existingManifest) {
    for (const photo of existingManifest.photos) {
      existingPhotosById.set(photo.id, photo);
    }
  }

  const photos: Photo[] = [];
  const validIds = new Set<string>();

  for (const file of jpgFiles) {
    const sourcePath = path.join(sourceDir, file);
    console.log(`Processing: ${file}`);

    const id = await generateStableId(sourcePath);
    validIds.add(id);

    const existing = existingPhotosById.get(id);
    if (existing) {
      const metadata = await readMetadata(sourcePath);
      const { original, ...variantsWithoutOriginal } = existing.variants as any;
      photos.push({
        ...existing,
        originalFilename: file,
        takenAt: metadata.takenAt,
        tags: metadata.tags,
        description: metadata.description,
        exif: metadata.exif,
        variants: variantsWithoutOriginal,
      });
      console.log(`  ID: ${id} (using cached derivatives)`);
      continue;
    }

    console.log(`  ID: ${id} (generating derivatives...)`);

    const [metadata, placeholder, derivativeResult] = await Promise.all([
      readMetadata(sourcePath),
      generateBlurhash(sourcePath),
      generateDerivatives(sourcePath, id, baseDir),
    ]);

    const photo: Photo = {
      id,
      originalFilename: file,
      width: derivativeResult.width,
      height: derivativeResult.height,
      aspectRatio: derivativeResult.width / derivativeResult.height,
      takenAt: metadata.takenAt,
      tags: metadata.tags,
      description: metadata.description,
      placeholder,
      variants: derivativeResult.variants,
      exif: metadata.exif,
    };

    photos.push(photo);
  }

  await cleanupStaleFiles(validIds, baseDir);

  const tagIndex: Record<string, string[]> = {};
  for (const photo of photos) {
    for (const tag of photo.tags) {
      if (!tagIndex[tag]) {
        tagIndex[tag] = [];
      }
      tagIndex[tag].push(photo.id);
    }
  }

  photos.sort((a, b) => {
    if (a.takenAt && b.takenAt) return a.takenAt.localeCompare(b.takenAt);
    if (a.takenAt) return -1;
    if (b.takenAt) return 1;
    return a.originalFilename.localeCompare(b.originalFilename);
  });

  const manifest: Manifest = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    photos,
    tagIndex: Object.fromEntries(
      Object.entries(tagIndex).sort(([a], [b]) => a.localeCompare(b))
    ),
  };

  await fs.mkdir(path.dirname(path.join(baseDir, MANIFEST_PATH)), { recursive: true });
  await fs.writeFile(
    path.join(baseDir, MANIFEST_PATH),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`\nManifest written with ${photos.length} photos`);
  console.log(`Tags: ${Object.keys(tagIndex).join(', ') || '(none)'}`);

  await closeExifTool();
}

sync().catch((err) => {
  console.error('Sync failed:', err);
  closeExifTool().finally(() => process.exit(1));
});
