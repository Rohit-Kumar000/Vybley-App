"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { buildSrc, type UploadResponse } from "@imagekit/next";
import { Rocket } from "lucide-react";
import { apiClient, type VideoFormData } from "@/lib/api-client";
import { useNotification } from "./Notification";
import FileUpload from "./FileUpload";

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 2000;

export default function VideoUploadForm() {
  const router = useRouter();
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<VideoFormData>({
    defaultValues: { title: "", description: "", videoUrl: "", thumbnailUrl: "" },
  });

  // useWatch (instead of watch) keeps the form compatible with React Compiler.
  const [title, description, videoUrl] = useWatch({
    control,
    name: ["title", "description", "videoUrl"],
  });

  // Keep the stored file path and build an auto-generated thumbnail URL from it.
  const handleUploadSuccess = (response: UploadResponse) => {
    if (!response.filePath) {
      showNotification("Video upload failed. Please try again.", "error");
      return;
    }

    setValue("videoUrl", response.filePath, { shouldDirty: true });
    setValue(
      "thumbnailUrl",
      buildSrc({
        urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
        src: `${response.filePath}/ik-thumbnail.jpg`,
      }),
      { shouldDirty: true }
    );

    showNotification("Video uploaded successfully!", "success");
  };

  const onSubmit = async (data: VideoFormData) => {
    if (!data.videoUrl || !data.thumbnailUrl) {
      showNotification("Please upload a video first", "error");
      return;
    }

    try {
      await apiClient.createVideo({
        title: data.title.trim(),
        description: data.description.trim(),
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
      });

      showNotification("Your reel is live!", "success");
      router.push("/profile");
      router.refresh();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : "Failed to publish video", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Video</legend>
        <FileUpload onSuccess={handleUploadSuccess} />
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Title</legend>
        <input
          type="text"
          placeholder="Give your reel a catchy title"
          maxLength={TITLE_MAX}
          className={`input w-full ${errors.title ? "input-error" : ""}`}
          {...register("title", {
            required: "Title is required",
            maxLength: { value: TITLE_MAX, message: `Title cannot exceed ${TITLE_MAX} characters` },
            validate: (value) => value.trim().length > 0 || "Title cannot be empty",
          })}
        />
        <p className={`label justify-between ${errors.title ? "text-error" : "text-muted"}`}>
          <span>{errors.title?.message}</span>
          <span>
            {title.length}/{TITLE_MAX}
          </span>
        </p>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Description</legend>
        <textarea
          rows={5}
          placeholder="Tell people what your video is about..."
          maxLength={DESCRIPTION_MAX}
          className={`textarea w-full resize-none ${errors.description ? "textarea-error" : ""}`}
          {...register("description", {
            required: "Description is required",
            maxLength: { value: DESCRIPTION_MAX, message: `Description cannot exceed ${DESCRIPTION_MAX} characters` },
            validate: (value) => value.trim().length > 0 || "Description cannot be empty",
          })}
        />
        <p className={`label justify-between ${errors.description ? "text-error" : "text-muted"}`}>
          <span>{errors.description?.message}</span>
          <span>
            {description.length}/{DESCRIPTION_MAX}
          </span>
        </p>
      </fieldset>

      <button type="submit" disabled={isSubmitting || !videoUrl} className="btn btn-primary btn-lg w-full">
        {isSubmitting ? (
          <>
            <span className="loading loading-spinner" />
            Publishing...
          </>
        ) : (
          <>
            <Rocket className="h-5 w-5" />
            Publish reel
          </>
        )}
      </button>
    </form>
  );
}
