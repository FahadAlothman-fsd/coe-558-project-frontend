import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import type { ImageSource } from "@/types/chat"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Creates a data URL from a raw base64 string and mime type
 * @param base64Data The raw base64 string (without any prefix)
 * @param mimeType The MIME type of the image (e.g., 'image/png', 'image/jpeg')
 * @returns A properly formatted data URL
 */
export function createDataUrl(base64Data: string, mimeType = "image/png"): {
  url: string,
  blob: Blob
} {
  // Convert Latin-1 string back to binary
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  return {
    "url": url,
    "blob": blob,
  }
}

/**
 * Determines if a string is a base64 encoded image
 */
export function isBase64Image(str: string): boolean {
  return str.startsWith("data:image/") && str.includes("base64,")
}

/**
 * Determines if a URL is from Google Cloud Storage
 */
export function isGoogleCloudStorageUrl(url: string): boolean {
  return url.startsWith("https://storage.googleapis.com/") || url.startsWith("https://storage.cloud.google.com/")
}

/**
 * Creates an ImageSource object from a string
 * Automatically detects if it's base64, GCS URL, or regular URL
 */
export function createImageSource(imageData: string, mimeType?: string): ImageSource {
  if (isGoogleCloudStorageUrl(imageData)) {
    return { type: "gcs", data: imageData }
  } else if (mimeType) {
    // If we have a mime type and the data doesn't have a prefix,
    // assume it's a raw base64 string and create a data URL
    return { type: "base64", data: createDataUrl(imageData, mimeType) }
  } else {
    // If we can't determine the type, treat it as a URL
    return { type: "url", data: imageData }
  }
}

/**
 * Gets the appropriate src attribute for an image based on its source type
 */
export function getImageSrc(image: ImageSource | null | undefined): string {
  if (!image) return ""
  if (image.type === "base64") {
    return image.data.url
  }
  return image.data
}

/**
 * Migrates legacy image data to the new ImageSource format
 */
export function migrateImageData(
  imageUrl?: string | null,
  imageData?: string | null,
  mimeType?: string,
): ImageSource | undefined {
  if (imageData) {
    return createImageSource(imageData, mimeType)
  } else if (imageUrl) {
    return createImageSource(imageUrl, mimeType)
  }
  return undefined
}

export async function fetchBlobFromUrl(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }
  return await response.blob();
}

