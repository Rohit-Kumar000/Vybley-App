import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { CloudUpload, Heart, Video } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getVideos } from "@/lib/videos";
import VideoFeed from "../components/VideoFeed";

export const metadata = { title: "My profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const videos = await getVideos({ userId, viewerId: userId });
  const totalLikes = videos.reduce((sum, video) => sum + video.likesCount, 0);
  const name = session.user.email?.split("@")[0] ?? "creator";

  return (
    <div className="space-y-10">
      <section className="surface flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
        <span className="grid h-20 w-20 shrink-0 place-items-center self-start rounded-full bg-linear-to-br from-secondary via-primary to-accent text-3xl font-extrabold text-white shadow-xl shadow-primary/30">
          {name.charAt(0).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-extrabold">@{name}</h1>
          <p className="truncate text-sm text-muted">{session.user.email}</p>

          <div className="stats mt-4 border border-line bg-base-300/50">
            <div className="stat px-5 py-3">
              <div className="stat-figure text-info">
                <Video className="h-6 w-6" />
              </div>
              <div className="stat-title">Videos</div>
              <div className="stat-value text-2xl text-info">{videos.length}</div>
            </div>
            <div className="stat px-5 py-3">
              <div className="stat-figure text-accent">
                <Heart className="h-6 w-6 fill-current" />
              </div>
              <div className="stat-title">Likes</div>
              <div className="stat-value text-2xl text-accent">{totalLikes}</div>
            </div>
          </div>
        </div>

        <Link href="/upload" className="btn btn-primary">
          <CloudUpload className="h-4 w-4" />
          New reel
        </Link>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">My reels</h2>
        <VideoFeed
          videos={videos}
          canDelete
          emptyTitle="You have not posted anything yet"
          emptyText="Upload your first reel and it will show up here."
        />
      </section>
    </div>
  );
}
