import express from 'express';
import cors from 'cors';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import type { Manifest, Photo, PhotoUpdatePayload, BulkTagPayload } from '@africa/shared';
import { readMetadata, writeMetadata, setHeroTag, closeExifTool } from '../../photos/src/lib/metadata-reader';
import { generateStableId } from '../../photos/src/lib/id-generator';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const SOURCE_DIR = 'photos/original';
const MANIFEST_PATH = 'apps/public/src/assets/photos/manifest.json';
const THUMB_CACHE = new Map<string, Buffer>();

interface WriteMutex {
  promise: Promise<void> | null;
}

const writeMutexes = new Map<string, WriteMutex>();

let idCache: Map<string, string> | null = null;
let idCacheTime = 0;
const ID_CACHE_TTL = 60000;

async function withFileLock<T>(filePath: string, fn: () => Promise<T>): Promise<T> {
  let mutex = writeMutexes.get(filePath);
  if (!mutex) {
    mutex = { promise: null };
    writeMutexes.set(filePath, mutex);
  }

  while (mutex.promise) {
    await mutex.promise;
  }

  let resolve: () => void;
  mutex.promise = new Promise<void>((r) => (resolve = r));

  try {
    return await fn();
  } finally {
    mutex.promise = null;
    resolve!();
  }
}

async function getManifest(): Promise<Manifest | null> {
  try {
    const content = await fs.readFile(MANIFEST_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function getAllSourceFiles(forceRefresh = false): Promise<Map<string, string>> {
  const now = Date.now();
  if (!forceRefresh && idCache && (now - idCacheTime) < ID_CACHE_TTL) {
    return idCache;
  }

  console.log('Building photo ID cache...');
  const files = await fs.readdir(SOURCE_DIR);
  const jpgFiles = files.filter((f) => /\.(jpg|jpeg)$/i.test(f));
  const result = new Map<string, string>();

  await Promise.all(
    jpgFiles.map(async (file) => {
      const filePath = path.join(SOURCE_DIR, file);
      const id = await generateStableId(filePath);
      result.set(id, filePath);
    })
  );

  idCache = result;
  idCacheTime = now;
  console.log(`Cached ${result.size} photo IDs`);

  return result;
}

async function getSourcePathById(id: string): Promise<string | null> {
  const files = await getAllSourceFiles();
  return files.get(id) || null;
}

function invalidateIdCache(): void {
  idCache = null;
}

app.get('/api/photos', async (_req, res) => {
  try {
    const sourceFiles = await getAllSourceFiles();
    const photos: Array<{
      id: string;
      filename: string;
      tags: string[];
      description: string | null;
      takenAt: string | null;
    }> = [];

    for (const [id, filePath] of sourceFiles) {
      const metadata = await readMetadata(filePath);
      photos.push({
        id,
        filename: path.basename(filePath),
        tags: metadata.tags,
        description: metadata.description,
        takenAt: metadata.takenAt,
      });
    }

    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/photos/:id', async (req, res) => {
  try {
    const filePath = await getSourcePathById(req.params.id);
    if (!filePath) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const metadata = await readMetadata(filePath);
    res.json({
      id: req.params.id,
      filename: path.basename(filePath),
      ...metadata,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.patch('/api/photos/:id', async (req, res) => {
  try {
    const filePath = await getSourcePathById(req.params.id);
    if (!filePath) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const payload = req.body as PhotoUpdatePayload;

    await withFileLock(filePath, async () => {
      await writeMetadata(filePath, {
        tags: payload.tags,
        description: payload.description,
      });
    });

    const metadata = await readMetadata(filePath);
    res.json({
      id: req.params.id,
      filename: path.basename(filePath),
      ...metadata,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/photos/:id/hero', async (req, res) => {
  try {
    const targetPath = await getSourcePathById(req.params.id);
    if (!targetPath) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const sourceFiles = await getAllSourceFiles();
    const allPaths = Array.from(sourceFiles.values());

    await setHeroTag(allPaths, targetPath);

    res.json({ success: true, heroId: req.params.id });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/photos/bulk/tags/add', async (req, res) => {
  try {
    const payload = req.body as BulkTagPayload;
    const sourceFiles = await getAllSourceFiles();

    for (const id of payload.photoIds) {
      const filePath = sourceFiles.get(id);
      if (!filePath) continue;

      await withFileLock(filePath, async () => {
        const metadata = await readMetadata(filePath);
        const newTags = [...new Set([...metadata.tags, ...payload.tags])];
        await writeMetadata(filePath, { tags: newTags });
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/photos/bulk/tags/remove', async (req, res) => {
  try {
    const payload = req.body as BulkTagPayload;
    const sourceFiles = await getAllSourceFiles();
    const tagsToRemove = new Set(payload.tags);

    for (const id of payload.photoIds) {
      const filePath = sourceFiles.get(id);
      if (!filePath) continue;

      await withFileLock(filePath, async () => {
        const metadata = await readMetadata(filePath);
        const newTags = metadata.tags.filter((t) => !tagsToRemove.has(t));
        await writeMetadata(filePath, { tags: newTags });
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/tags', async (_req, res) => {
  try {
    const sourceFiles = await getAllSourceFiles();
    const allTags = new Set<string>();

    for (const [, filePath] of sourceFiles) {
      const metadata = await readMetadata(filePath);
      for (const tag of metadata.tags) {
        allTags.add(tag);
      }
    }

    res.json([...allTags].sort());
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/thumb/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(SOURCE_DIR, filename);

    const cacheKey = filePath;
    if (THUMB_CACHE.has(cacheKey)) {
      res.set('Content-Type', 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=3600');
      return res.send(THUMB_CACHE.get(cacheKey));
    }

    const thumb = await sharp(filePath)
      .rotate()
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 70 })
      .toBuffer();

    THUMB_CACHE.set(cacheKey, thumb);

    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(thumb);
  } catch (err) {
    res.status(404).json({ error: 'Image not found' });
  }
});

app.post('/api/cache/refresh', async (_req, res) => {
  try {
    invalidateIdCache();
    THUMB_CACHE.clear();
    await getAllSourceFiles(true);
    res.json({ success: true, message: 'Cache refreshed' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

const server = app.listen(PORT, async () => {
  console.log(`Admin API running at http://localhost:${PORT}`);
  console.log('Preloading photo cache...');
  await getAllSourceFiles(true);
  console.log('Ready!');
});

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await closeExifTool();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeExifTool();
  server.close();
  process.exit(0);
});
