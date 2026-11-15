import Link from "next/link";
import { Clapperboard } from "lucide-react";
import type { VideoDTO } from "@/lib/video-types";
import VideoComponent from "./VideoComponent";

interface VideoFeedProps {
  videos: VideoDTO[];
  // Show the delete button on each card (used on the profile page).
  canDelete?: boolean;
  emptyTitle?: string;
  emptyText?: string;
}

export default function VideoFeed({
  videos,
  canDelete = false,
  emptyTitle = "No videos yet",
  emptyText = "Be the first to share a reel with the community.",
}: VideoFeedProps) {
  if (videos.length === 0) {
    return (
      <div className="surface flex min-h-[40vh] flex-col items-center justify-center px-6 py-16 text-center">
        <span className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/15 text-secondary">
          <Clapperboard className="h-8 w-8" />
        </span>
        <h2 className="text-xl font-bold">{emptyTitle}</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">{emptyText}</p>
        <Link href="/upload" className="btn btn-primary mt-6">
          Upload a reel
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoComponent key={video._id} video={video} canDelete={canDelete} />
      ))}
    </div>
  );
}
