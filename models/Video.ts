import mongoose, { Schema, model, models, type Model } from "mongoose";
// Registers the User model so `populate("userId")` always works.
import "./User";

export const VIDEO_DIMENSIONS = { width: 1080, height: 1920 } as const;

export interface IVideo {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  userId: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  controls?: boolean;
  transformation?: { height: number; width: number; quality?: number };
  createdAt?: Date;
  updatedAt?: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    title: {
      type: String,
      required: [true, "Video title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Video description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      required: [true, "Thumbnail URL is required"],
      trim: true,
    },
    // Owner of the video (needed for the profile page and delete permission).
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
      index: true,
    },
    // Users who liked the video; one entry per user.
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    controls: { type: Boolean, default: true },
    transformation: {
      height: { type: Number, default: VIDEO_DIMENSIONS.height, min: 1 },
      width: { type: Number, default: VIDEO_DIMENSIONS.width, min: 1 },
      quality: { type: Number, min: 1, max: 100, default: 80 },
    },
  },
  { timestamps: true }
);

videoSchema.index({ createdAt: -1 });

const Video: Model<IVideo> =
  (models.Video as Model<IVideo>) || model<IVideo>("Video", videoSchema);

export default Video;
