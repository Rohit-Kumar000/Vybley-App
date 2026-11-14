import mongoose, { isValidObjectId, type Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Video, { type IVideo } from "@/models/Video";
import type { VideoDTO } from "@/lib/video-types";

const NEW_WINDOW_MS = 24 * 60 * 60 * 1000;
const POPULAR_LIKES = 10;

type LeanVideo = Omit<IVideo, "_id" | "userId" | "likes" | "createdAt"> & {
  _id: Types.ObjectId;
  userId?: Types.ObjectId | { _id: Types.ObjectId; email: string } | null;
  likes?: Types.ObjectId[];
  createdAt: Date;
};

// Convert a lean Mongo document into a safe, JSON-friendly object.
// Only the email prefix is exposed as the author name (never the full email).
function toVideoDTO(video: LeanVideo, viewerId?: string): VideoDTO {
  const owner =
    video.userId && typeof video.userId === "object" && "email" in video.userId
      ? video.userId
      : null;

  const ownerId = owner?._id ?? (video.userId as Types.ObjectId | null | undefined);
  const likes = video.likes ?? [];
  const likesCount = likes.length;
  const isNew = Date.now() - new Date(video.createdAt).getTime() < NEW_WINDOW_MS;

  return {
    _id: video._id.toString(),
    title: video.title,
    description: video.description,
    videoUrl: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl,
    author: owner ? owner.email.split("@")[0] : "unknown",
    authorId: ownerId ? ownerId.toString() : "",
    likesCount,
    liked: viewerId ? likes.some((id) => id.toString() === viewerId) : false,
    badge: likesCount >= POPULAR_LIKES ? "popular" : isNew ? "new" : null,
    createdAt: new Date(video.createdAt).toISOString(),
  };
}

interface GetVideosOptions {
  userId?: string;
  viewerId?: string;
  limit?: number;
}

export async function getVideos({ userId, viewerId, limit = 60 }: GetVideosOptions = {}) {
  await connectToDatabase();

  const query = userId && isValidObjectId(userId) ? Video.find({ userId: new mongoose.Types.ObjectId(userId) }) : Video.find();

  const videos = await query
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "email")
    .lean();

  return (videos as unknown as LeanVideo[]).map((video) => toVideoDTO(video, viewerId));
}

export async function getVideoById(id: string, viewerId?: string) {
  if (!isValidObjectId(id)) return null;

  await connectToDatabase();

  const video = await Video.findById(id).populate("userId", "email").lean();

  return video ? toVideoDTO(video as unknown as LeanVideo, viewerId) : null;
}
