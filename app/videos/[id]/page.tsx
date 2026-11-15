import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getVideoById } from "@/lib/videos";
import LikeButton from "../../components/LikeButton";
import DeleteVideoButton from "../../components/DeleteVideoButton";
import VideoPlayer from "../../components/VideoPlayer";

type PageProps = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

// Shared between generateMetadata and the page so the DB is queried once per request.
const loadVideo = cache(async (id: string) => {
  const session = await getServerSession(authOptions);
  const video = await getVideoById(id, session?.user?.id);

  return { video, viewerId: session?.user?.id };
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { video } = await loadVideo(id);

  return { title: video?.title ?? "Video not found" };
}

export default async function VideoPage({ params }: PageProps) {
  const { id } = await params;
  const { video, viewerId } = await loadVideo(id);

  if (!video) notFound();

  const isOwner = viewerId === video.authorId;
  const postedOn = new Date(video.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/" className="btn btn-ghost btn-sm mb-6 text-info">
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </Link>

      <div className="grid gap-8 md:grid-cols-[minmax(0,360px)_1fr]">
        <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-line bg-base-300 shadow-2xl shadow-primary/20">
          <div className="aspect-9/16">
            <VideoPlayer videoUrl={video.videoUrl} thumbnailUrl={video.thumbnailUrl} />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{video.title}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-2 text-secondary">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-linear-to-br from-primary to-accent text-xs font-bold text-white">
                  {video.author.charAt(0).toUpperCase()}
                </span>
                @{video.author}
              </span>

              <span className="flex items-center gap-1.5 text-muted">
                <CalendarDays className="h-4 w-4" />
                {postedOn}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LikeButton videoId={video._id} initialLiked={video.liked} initialCount={video.likesCount} size="md" />
            {isOwner && <DeleteVideoButton videoId={video._id} redirectTo="/profile" withLabel />}
          </div>

          <div className="card border border-line bg-base-200 p-5">
            <h2 className="mb-2 text-sm font-semibold text-secondary">Description</h2>
            <p className="text-sm leading-relaxed whitespace-pre-line text-muted">{video.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
