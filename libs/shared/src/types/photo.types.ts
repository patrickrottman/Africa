export interface Variant {
  avifUrl?: string;
  webpUrl?: string;
  jpgUrl: string;
  width: number;
  height: number;
  bytes: number;
}

export interface VariantSet {
  thumb: Variant;
  medium: Variant;
  large: Variant;
  original: Omit<Variant, 'avifUrl' | 'webpUrl'>;
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

export interface Photo {
  id: string;
  originalFilename: string;
  width: number;
  height: number;
  aspectRatio: number;
  takenAt: string | null;
  tags: string[];
  description: string | null;
  placeholder: string;
  variants: VariantSet;
  exif: ExifData | null;
}

export interface Manifest {
  version: string;
  generatedAt: string;
  photos: Photo[];
  tagIndex: Record<string, string[]>;
}

export interface PhotoUpdatePayload {
  tags?: string[];
  description?: string | null;
}

export interface BulkTagPayload {
  photoIds: string[];
  tags: string[];
}
