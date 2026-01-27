import * as fs from 'fs/promises';
import * as path from 'path';
import type { Manifest, Photo } from '@africa/shared';

const MANIFEST_PATH = 'apps/public/src/assets/photos/manifest.json';
const ASSETS_PATH = 'apps/public/src/assets/photos';

interface ValidationError {
  type: 'error' | 'warning';
  message: string;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function check(): Promise<void> {
  const baseDir = process.cwd();
  const manifestPath = path.join(baseDir, MANIFEST_PATH);

  const errors: ValidationError[] = [];

  if (!(await fileExists(manifestPath))) {
    console.log('No manifest found. Run "npm run photos:sync" first.');
    process.exit(0);
  }

  let manifest: Manifest;
  try {
    const content = await fs.readFile(manifestPath, 'utf-8');
    manifest = JSON.parse(content);
  } catch (err) {
    errors.push({ type: 'error', message: `Invalid manifest JSON: ${err}` });
    printErrors(errors);
    process.exit(1);
  }

  if (!manifest.version) {
    errors.push({ type: 'error', message: 'Manifest missing version field' });
  }
  if (!manifest.generatedAt) {
    errors.push({ type: 'error', message: 'Manifest missing generatedAt field' });
  }
  if (!Array.isArray(manifest.photos)) {
    errors.push({ type: 'error', message: 'Manifest photos must be an array' });
    printErrors(errors);
    process.exit(1);
  }

  const ids = new Set<string>();
  for (const photo of manifest.photos) {
    if (ids.has(photo.id)) {
      errors.push({ type: 'error', message: `Duplicate photo ID: ${photo.id}` });
    }
    ids.add(photo.id);

    const photoErrors = await validatePhoto(photo, baseDir);
    errors.push(...photoErrors);
  }

  const heroPhotos = manifest.photos.filter((p) => p.tags.includes('_hero'));
  if (heroPhotos.length > 1) {
    errors.push({
      type: 'error',
      message: `Multiple photos have _hero tag: ${heroPhotos.map((p) => p.id).join(', ')}`,
    });
  }

  for (const [tag, photoIds] of Object.entries(manifest.tagIndex)) {
    for (const id of photoIds) {
      if (!ids.has(id)) {
        errors.push({
          type: 'error',
          message: `Tag index references non-existent photo: ${id} in tag "${tag}"`,
        });
      }
    }
  }

  printErrors(errors);

  const errorCount = errors.filter((e) => e.type === 'error').length;
  const warningCount = errors.filter((e) => e.type === 'warning').length;

  console.log(`\nValidation complete: ${manifest.photos.length} photos`);
  if (errorCount > 0) {
    console.log(`  ${errorCount} error(s), ${warningCount} warning(s)`);
    process.exit(1);
  } else if (warningCount > 0) {
    console.log(`  ${warningCount} warning(s)`);
  } else {
    console.log('  All checks passed!');
  }
}

async function validatePhoto(
  photo: Photo,
  baseDir: string
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  if (!photo.id || typeof photo.id !== 'string') {
    errors.push({ type: 'error', message: `Photo missing valid id` });
    return errors;
  }

  const requiredFields = ['originalFilename', 'width', 'height', 'placeholder', 'variants'];
  for (const field of requiredFields) {
    if (!(field in photo)) {
      errors.push({ type: 'error', message: `Photo ${photo.id} missing field: ${field}` });
    }
  }

  if (!photo.variants) return errors;

  const sizes = ['thumb', 'medium', 'large'] as const;
  for (const size of sizes) {
    const variant = photo.variants[size];
    if (!variant) {
      errors.push({ type: 'error', message: `Photo ${photo.id} missing ${size} variant` });
      continue;
    }

    const files = [variant.avifUrl, variant.webpUrl, variant.jpgUrl].filter(Boolean);
    for (const url of files) {
      const filePath = path.join(baseDir, 'apps/public/src', url!);
      if (!(await fileExists(filePath))) {
        errors.push({ type: 'error', message: `Missing file: ${url}` });
      }
    }
  }

  return errors;
}

function printErrors(errors: ValidationError[]): void {
  for (const error of errors) {
    const prefix = error.type === 'error' ? '❌' : '⚠️';
    console.log(`${prefix} ${error.message}`);
  }
}

check().catch((err) => {
  console.error('Check failed:', err);
  process.exit(1);
});
