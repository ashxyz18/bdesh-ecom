"use client";

import { useState, useCallback } from "react";

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
}

/**
 * Hook to upload images to the media API and return public URLs.
 * Replaces the base64 data URL approach with proper server-side storage.
 */
export function useImageUpload(storeId: string | undefined) {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  });

  const uploadImages = useCallback(
    async (files: File[]): Promise<string[]> => {
      if (!storeId) return [];

      setState({ uploading: true, progress: 0, error: null });
      const urls: string[] = [];
      let completed = 0;

      try {
        // Upload files sequentially to avoid overwhelming the server
        for (const file of files) {
          // Client-side validation
          if (file.size > 10 * 1024 * 1024) {
            setState((prev) => ({
              ...prev,
              error: `${file.name} exceeds 10MB limit`,
            }));
            continue;
          }

          if (!file.type.startsWith("image/")) {
            setState((prev) => ({
              ...prev,
              error: `${file.name} is not an image file`,
            }));
            continue;
          }

          const formData = new FormData();
          formData.append("file", file);

          try {
            const res = await fetch(`/api/${storeId}/media`, {
              method: "POST",
              body: formData,
            });

            if (res.ok) {
              const data = await res.json();
              if (data.media?.url) {
                urls.push(data.media.url);
              }
            } else {
              const data = await res.json().catch(() => ({}));
              setState((prev) => ({
                ...prev,
                error: data.message || `Failed to upload ${file.name}`,
              }));
            }
          } catch {
            setState((prev) => ({
              ...prev,
              error: `Network error uploading ${file.name}`,
            }));
          }

          completed++;
          setState((prev) => ({
            ...prev,
            progress: Math.round((completed / files.length) * 100),
          }));
        }
      } finally {
        setState((prev) => ({ ...prev, uploading: false, progress: 100 }));
      }

      return urls;
    },
    [storeId]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    uploadImages,
    clearError,
  };
}
