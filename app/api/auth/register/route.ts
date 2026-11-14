import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // bcrypt silently ignores everything after 72 bytes.
    if (Buffer.byteLength(password) > 72) {
      return NextResponse.json({ error: "Password is too long (max 72 characters)" }, { status: 400 });
    }

    await connectToDatabase();

    if (await User.exists({ email })) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    await User.create({ email, password });

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    // Duplicate key: two requests registered the same email at once.
    if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    console.error("Registration error:", error);

    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}
