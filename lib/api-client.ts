export interface VideoFormData {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
}

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

// Thin wrapper around fetch that throws readable errors.
class ApiClient {
  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { method = "GET", body } = options;

    const response = await fetch(`/api${endpoint}`, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || "Something went wrong. Please try again.");
    }

    return data as T;
  }

  createVideo(videoData: VideoFormData) {
    return this.request<{ _id: string }>("/videos", { method: "POST", body: videoData });
  }

  toggleLike(id: string) {
    return this.request<{ liked: boolean; likesCount: number }>(
      `/videos/${encodeURIComponent(id)}/like`,
      { method: "POST" }
    );
  }

  deleteVideo(id: string) {
    return this.request<{ message: string }>(`/videos/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();
