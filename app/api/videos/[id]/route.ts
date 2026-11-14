import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video from "@/models/Video";

type RouteContext = { params: Promise<{ id: string }> };

// Delete a video. Only the owner is allowed to do this.
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid video id" }, { status: 400 });
    }

    await connectToDatabase();

    const video = await Video.findById(id).select("userId");

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (video.userId?.toString() !== session.user.id) {
      return NextResponse.json({ error: "You can only delete your own videos" }, { status: 403 });
    }

    await video.deleteOne();

    return NextResponse.json({ message: "Video deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting video:", error);

    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
