// Serializable video shape shared by server and client components.
export interface VideoDTO {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  author: string;
  authorId: string;
  likesCount: number;
  liked: boolean;
  badge: "new" | "popular" | null;
  createdAt: string;
}
