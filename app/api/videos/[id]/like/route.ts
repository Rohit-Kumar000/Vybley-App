import { NextRequest, NextResponse } from "next/server";
import mongoose, { isValidObjectId } from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";

type RouteContext = { params: Promise<{ id: string }> };

// Toggle the signed-in user's like on a video.
export async function POST(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please sign in to like videos" }, { status: 401 });
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid video id" }, { status: 400 });
    }

    await connectToDatabase();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const existing = await Video.findById(id).select("likes");

    if (!existing) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const alreadyLiked = existing.likes.some((like) => like.equals(userId));

    // $addToSet / $pull keep the update atomic and free of duplicates.
    const updated = await Video.findByIdAndUpdate(
      id,
      alreadyLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } },
      { new: true }
    ).select("likes");

    return NextResponse.json({
      liked: !alreadyLiked,
      likesCount: updated?.likes.length ?? 0,
    });
  } catch (error) {
    console.error("Error toggling like:", error);

    return NextResponse.json({ error: "Failed to update like" }, { status: 500 });
  }
}
