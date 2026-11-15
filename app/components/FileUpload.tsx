"use client";

import { useState, type ChangeEvent } from "react";
import { upload, type UploadResponse } from "@imagekit/next";
import { CircleCheck, CloudUpload } from "lucide-react";

interface FileUploadProps {
  onSuccess: (res: UploadResponse) => void;
}

interface UploadAuth {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
}

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

export default function FileUpload({ onSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("video/")) return "Please choose a valid video file";
    if (file.size > MAX_VIDEO_SIZE) return "Video size must not exceed 100MB";
    return null;
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];

    if (!file || uploading) return;

    setError(null);

    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      input.value = "";
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Fetch a fresh signed token for every upload.
      const authResponse = await fetch("/api/imagekit-auth", { cache: "no-store" });

      if (!authResponse.ok) throw new Error("Could not authenticate the upload. Please sign in again.");

      const auth: UploadAuth = await authResponse.json();

      const result = await upload({
        file,
        fileName: file.name,
        folder: "/videos",
        useUniqueFileName: true,
        publicKey: auth.publicKey,
        token: auth.token,
        expire: auth.expire,
        signature: auth.signature,
        onProgress: (progressEvent) => {
          if (progressEvent.total > 0) {
            setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
          }
        },
      });

      setProgress(100);
      setFileName(file.name);
      onSuccess(result);
    } catch (err) {
      console.error("ImageKit upload error:", err);
      setError(err instanceof Error ? err.message : "File upload failed");
    } finally {
      setUploading(false);
      input.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <label
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-box border-2 border-dashed px-6 py-10 text-center transition ${
          uploading
            ? "pointer-events-none border-primary/60 bg-primary/5"
            : "border-line bg-base-300/40 hover:border-primary/60 hover:bg-primary/5"
        }`}
      >
        <input type="file" accept="video/*" onChange={handleFileChange} disabled={uploading} className="sr-only" />

        {uploading ? (
          <span className="loading loading-spinner loading-lg text-primary" />
        ) : fileName ? (
          <CircleCheck className="h-9 w-9 text-success" />
        ) : (
          <CloudUpload className="h-9 w-9 text-secondary" />
        )}

        <p className="text-sm font-semibold">
          {uploading ? `Uploading... ${progress}%` : (fileName ?? "Click to choose a video")}
        </p>
        <p className="text-xs text-muted">
          {fileName && !uploading ? "Click to replace it" : "MP4, MOV or WebM - up to 100MB - vertical 9:16 works best"}
        </p>
      </label>

      {uploading && <progress className="progress progress-primary w-full" value={progress} max={100} />}

      {error && (
        <div role="alert" className="alert alert-soft alert-error text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
