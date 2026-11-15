"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useNotification } from "./Notification";

interface DeleteVideoButtonProps {
  videoId: string;
  // Where to go after deleting; omit to just refresh the current page.
  redirectTo?: string;
  withLabel?: boolean;
  size?: "sm" | "md";
}

export default function DeleteVideoButton({
  videoId,
  redirectTo,
  withLabel = false,
  size = "sm",
}: DeleteVideoButtonProps) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { showNotification } = useNotification();

  const handleDelete = async () => {
    if (deleting || !window.confirm("Delete this video permanently?")) return;

    setDeleting(true);

    try {
      await apiClient.deleteVideo(videoId);
      showNotification("Video deleted", "success");

      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : "Failed to delete video", "error");
      setDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      aria-label="Delete video"
      className={`btn btn-error btn-soft rounded-full ${size === "md" ? "btn-md" : "btn-sm"}`}
    >
      {deleting ? <span className="loading loading-spinner loading-xs" /> : <Trash2 className="h-3.5 w-3.5" />}
      {withLabel && "Delete"}
    </button>
  );
}
