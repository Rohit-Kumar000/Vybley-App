"use client";

import { Video } from "@imagekit/next";

// Full-size player used on the video detail page.
export default function VideoPlayer({ videoUrl, thumbnailUrl }: { videoUrl: string; thumbnailUrl: string }) {
  return (
    <Video
      src={videoUrl}
      poster={thumbnailUrl}
      transformation={[{ height: 1920, width: 1080 }]}
      controls
      preload="metadata"
      playsInline
      className="h-full w-full object-cover"
    />
  );
}
