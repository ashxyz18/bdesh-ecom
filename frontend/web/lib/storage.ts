import { supabase } from "./supabase";

const BUCKET_NAME = "store-media";

/**
 * Ensure the storage bucket exists (called once on first upload)
 */
async function ensureBucket(): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "image/svg+xml",
          "image/avif",
        ],
      });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Upload a file to Supabase Storage and return the public URL.
 * Falls back to a data URL if Supabase is not configured.
 */
export async function uploadFile(
  storeId: string,
  file: File
): Promise<{ url: string; storageKey: string }> {
  // Try Supabase Storage first
  if (supabase) {
    await ensureBucket();

    const ext = file.name.split(".").pop() || "bin";
    const timestamp = Date.now();
    const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 50);
    const storageKey = `${storeId}/${timestamp}-${sanitized}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storageKey, file, {
        contentType: file.type,
        upsert: false,
      });

    if (!error) {
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storageKey);

      return {
        url: urlData.publicUrl,
        storageKey,
      };
    }

    console.error("Supabase upload error:", error.message);
  }

  // Fallback: return a placeholder — the caller should handle this
  throw new Error(
    "File upload failed. Supabase storage is not configured or unavailable."
  );
}

/**
 * Delete a file from Supabase Storage by its storage key
 */
export async function deleteFile(storageKey: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storageKey]);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Extract the storage key from a public URL
 */
export function getStorageKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    // Path format: /storage/v1/object/public/store-media/{storeId}/{filename}
    const bucketIndex = pathParts.indexOf(BUCKET_NAME);
    if (bucketIndex >= 0 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join("/");
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if Supabase storage is available
 */
export function isStorageAvailable(): boolean {
  return !!supabase;
}
