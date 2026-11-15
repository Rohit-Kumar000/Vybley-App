"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useNotification } from "./Notification";

interface LikeButtonProps {
  videoId: string;
  initialLiked: boolean;
  initialCount: number;
  size?: "sm" | "md";
}

export default function LikeButton({ videoId, initialLiked, initialCount, size = "sm" }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const { status } = useSession();
  const router = useRouter();
  const { showNotification } = useNotification();

  const handleClick = async () => {
    if (pending) return;

    if (status !== "authenticated") {
      showNotification("Sign in to like videos", "info");
      router.push("/login");
      return;
    }

    // Optimistic update, rolled back if the request fails.
    const previous = { liked, count };

    setPending(true);
    setLiked(!liked);
    setCount((value) => value + (liked ? -1 : 1));

    try {
      const result = await apiClient.toggleLike(videoId);

      setLiked(result.liked);
      setCount(result.likesCount);
    } catch (error) {
      setLiked(previous.liked);
      setCount(previous.count);
      showNotification(error instanceof Error ? error.message : "Could not update like", "error");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? "Unlike video" : "Like video"}
      className={`btn rounded-full ${size === "md" ? "btn-md" : "btn-sm"} ${
        liked ? "btn-accent btn-soft" : "btn-ghost text-muted hover:text-accent"
      }`}
    >
      <Heart className={size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"} fill={liked ? "currentColor" : "none"} />
      {count}
    </button>
  );
}
