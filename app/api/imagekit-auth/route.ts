import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getUploadAuthParams } from "@imagekit/next/server";
import { authOptions } from "@/lib/auth";

// Issues short-lived upload credentials. Only signed-in users may upload.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      throw new Error("ImageKit keys are missing in the environment");
    }

    const { token, expire, signature } = getUploadAuthParams({ privateKey, publicKey });

    return NextResponse.json({ token, expire, signature, publicKey });
  } catch (error) {
    console.error("ImageKit authentication error:", error);

    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
