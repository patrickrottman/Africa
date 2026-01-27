export function isInternalTag(tag: string): boolean {
  return tag.startsWith('_');
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function groupPhotosByDate<T extends { takenAt: string | null }>(
  photos: T[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const photo of photos) {
    const key = photo.takenAt ? photo.takenAt.split('T')[0] : 'unknown';
    const group = groups.get(key) || [];
    group.push(photo);
    groups.set(key, group);
  }
  return groups;
}
