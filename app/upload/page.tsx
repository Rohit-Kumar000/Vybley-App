import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import VideoUploadForm from "../components/VideoUploadForm";

export const metadata = { title: "Upload" };

export default async function VideoUploadPage() {
  // Server-side guard: anonymous visitors are sent to the login page.
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Upload a new <span className="text-gradient">reel</span>
        </h1>
        <p className="mt-2 text-sm text-muted">Share your video with the Vybely community.</p>
      </div>

      <div className="card border border-line bg-base-200 p-6 sm:p-8">
        <VideoUploadForm />
      </div>
    </div>
  );
}
