import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getVideos } from "@/lib/videos";
import Video from "@/models/Video";

// Public feed (newest first). `liked` reflects the signed-in viewer, if any.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const videos = await getVideos({ viewerId: session?.user?.id });

    return NextResponse.json(videos, { status: 200 });
  } catch (error) {
    console.error("Error fetching videos:", error);

    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);

    const read = (value: unknown) => (typeof value === "string" ? value.trim() : "");

    const title = read(body?.title);
    const description = read(body?.description);
    const videoUrl = read(body?.videoUrl);
    const thumbnailUrl = read(body?.thumbnailUrl);

    if (!title || !description || !videoUrl || !thumbnailUrl) {
      return NextResponse.json({ error: "All video fields are required" }, { status: 400 });
    }

    if (title.length > 100 || description.length > 2000) {
      return NextResponse.json(
        { error: "Title or description exceeds the allowed length" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const video = await Video.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      userId: session.user.id,
    });

    return NextResponse.json({ _id: video._id.toString() }, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);

    return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
  }
}
