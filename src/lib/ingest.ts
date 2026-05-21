import exifr from "exifr";
import { StorageAdapter } from "./storage/adapter";
import { CatalogEntry, ExifData, generateId } from "./types";

export type IngestTarget = {
  setId: string;
  sectionId: string;
};

export async function ingestPhoto(
  file: File,
  _target: IngestTarget,
  adapter: StorageAdapter
): Promise<string> {
  const id = generateId();

  // 1. Extract EXIF
  let exif: ExifData = {};
  try {
    const exifData = await exifr.parse(file);
    if (exifData) {
      exif = mapExif(exifData);
    }
  } catch {
    // Gracefully ignore EXIF extraction failures
  }

  // 2. Resize / convert to WebP
  const blob = await resizeToWebP(file);

  // 3. Determine final dimensions from the resized blob
  let width = 0;
  let height = 0;
  try {
    const bmp = await createImageBitmap(blob);
    width = bmp.width;
    height = bmp.height;
    bmp.close();
  } catch {
    // Fallback: if we can't read the blob back, use original file size as rough estimate
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise<void>((resolve) => {
      img.onload = () => {
        width = img.naturalWidth;
        height = img.naturalHeight;
        URL.revokeObjectURL(img.src);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve();
      };
    });
  }

  // 4. Store blob
  await adapter.putBlob(`photo:${id}`, blob);

  // 5. Update catalog index
  const catalogDoc = await adapter.getDoc<CatalogEntry[]>("catalog-index");
  const catalog: CatalogEntry[] = catalogDoc ?? [];
  const entry: CatalogEntry = {
    id,
    filename: file.name,
    mimeType: "image/webp",
    width,
    height,
    exif,
    addedAt: new Date().toISOString(),
  };
  catalog.push(entry);
  await adapter.setDoc("catalog-index", catalog);

  return id;
}

function mapExif(data: Record<string, unknown>): ExifData {
  const exif: ExifData = {};
  if (data.DateTimeOriginal || data.dateTimeOriginal || data.CreateDate) {
    exif.dateTaken = String(data.DateTimeOriginal ?? data.dateTimeOriginal ?? data.CreateDate);
  }
  if (data.Make || data.Model) {
    exif.camera = [data.Make, data.Model].filter(Boolean).join(" ") as string;
  }
  if (data.LensModel || data.lensModel) {
    exif.lens = String(data.LensModel ?? data.lensModel);
  }
  if (typeof data.FocalLength === "number") {
    exif.focalLength = data.FocalLength;
  }
  if (typeof data.FNumber === "number") {
    exif.aperture = data.FNumber;
  }
  if (data.ExposureTime) {
    exif.shutterSpeed = String(data.ExposureTime);
  }
  if (typeof data.ISO === "number") {
    exif.iso = data.ISO;
  }
  if (
    typeof data.latitude === "number" &&
    typeof data.longitude === "number"
  ) {
    exif.gps = { lat: data.latitude, lng: data.longitude };
  } else if (
    typeof data.GPSLatitude === "number" &&
    typeof data.GPSLongitude === "number"
  ) {
    exif.gps = { lat: data.GPSLatitude, lng: data.GPSLongitude };
  }
  return exif;
}

async function resizeToWebP(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const maxDim = 2400;
  let { width, height } = bmp;

  if (Math.max(width, height) > maxDim) {
    const ratio = maxDim / Math.max(width, height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bmp.close();
    throw new Error("Could not get 2d context from OffscreenCanvas");
  }
  ctx.drawImage(bmp, 0, 0, width, height);
  bmp.close();

  const blob = await canvas.convertToBlob({ type: "image/webp", quality: 0.85 });
  return blob;
}
