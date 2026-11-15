"use client";

import Link from "next/link";
import { Video } from "@imagekit/next";
import { Flame, Sparkles } from "lucide-react";
import type { VideoDTO } from "@/lib/video-types";
import LikeButton from "./LikeButton";
import DeleteVideoButton from "./DeleteVideoButton";

interface VideoComponentProps {
  video: VideoDTO;
  canDelete?: boolean;
}

export default function VideoComponent({ video, canDelete = false }: VideoComponentProps) {
  return (
    <article className="card border border-line bg-base-200 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_60px_-24px_rgb(124_58_237/0.6)]">
      <figure className="relative aspect-9/16 bg-base-300">
        <Video
          src={video.videoUrl}
          poster={video.thumbnailUrl}
          transformation={[{ height: 1920, width: 1080 }]}
          controls
          preload="none"
          playsInline
          className="h-full w-full object-cover"
        />

        {video.badge && (
          <span className="badge badge-warning pointer-events-none absolute top-3 left-3 gap-1 font-bold uppercase shadow-lg">
            {video.badge === "popular" ? <Flame className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
            {video.badge === "popular" ? "Popular" : "New"}
          </span>
        )}
      </figure>

      <div className="card-body gap-3 p-4">
        <div>
          <Link href={`/videos/${video._id}`} className="line-clamp-1 text-base font-bold transition hover:text-info">
            {video.title}
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{video.description}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2 text-xs text-secondary">
            <span className="avatar avatar-placeholder">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-accent text-[10px] font-bold leading-none text-white">
                {video.author.charAt(0).toUpperCase()}
              </span>
            </span>

            <span className="truncate">@{video.author}</span>
          </span>

          <div className="flex items-center gap-1.5">
            {canDelete && <DeleteVideoButton videoId={video._id} />}
            <LikeButton videoId={video._id} initialLiked={video.liked} initialCount={video.likesCount} />
          </div>
        </div>
      </div>
    </article>
  );
}
