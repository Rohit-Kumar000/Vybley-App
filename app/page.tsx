import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { CloudUpload, Sparkles } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getVideos } from "@/lib/videos";
import VideoFeed from "./components/VideoFeed";

// The feed depends on the signed-in viewer (likes), so never cache it.
export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const videos = await getVideos({ viewerId: session?.user?.id });

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-linear-to-br from-primary/25 via-base-200 to-accent/15 px-6 py-12 sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-info/20 blur-3xl" />

        <span className="badge badge-warning badge-soft badge-lg relative gap-1.5 font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          Short videos, big vibes
        </span>

        <h1 className="relative mt-5 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-6xl">
          Share your <span className="text-gradient">vibe</span> with the world.
        </h1>

        <p className="relative mt-4 max-w-xl text-base text-muted sm:text-lg">
          Upload reels, discover creators and show some love to the moments that make you smile.
        </p>

        <div className="relative mt-8 flex flex-wrap gap-3">
          {session ? (
            <Link href="/upload" className="btn btn-primary btn-lg">
              <CloudUpload className="h-5 w-5" />
              Upload a reel
            </Link>
          ) : (
            <>
              <Link href="/register" className="btn btn-primary btn-lg">
                Join for free
              </Link>
              <Link href="/login" className="btn btn-outline btn-lg">
                Log in
              </Link>
            </>
          )}
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Fresh reels</h2>
            <p className="mt-1 text-sm text-muted">The latest from the Vybely community.</p>
          </div>
          <span className="badge badge-info badge-soft">{videos.length} videos</span>
        </div>

        <VideoFeed videos={videos} />
      </section>
    </div>
  );
}
