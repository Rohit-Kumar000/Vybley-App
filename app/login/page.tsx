"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { LogIn } from "lucide-react";
import { useNotification } from "../components/Notification";
import PasswordInput from "../components/PasswordInput";

interface LoginFormData {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const router = useRouter();
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ defaultValues: { email: "", password: "" } });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await signIn("credentials", {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        redirect: false,
      });

      if (!result || result.error) {
        showNotification("Invalid email or password", "error");
        return;
      }

      showNotification("Welcome back!", "success");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      showNotification("Something went wrong. Please try again.", "error");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md py-6">
      <div className="card border border-line bg-base-200 shadow-2xl shadow-primary/10">
        <div className="card-body gap-6 p-8">
          <div className="text-center">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-primary to-accent shadow-lg shadow-primary/40">
              <LogIn className="h-6 w-6 text-white" />
            </span>
            <h1 className="text-2xl font-extrabold">Welcome back</h1>
            <p className="mt-1 text-sm text-muted">Sign in to continue your Vybely journey.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Email address</legend>
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={254}
                className={`input w-full ${errors.email ? "input-error" : ""}`}
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: EMAIL_REGEX, message: "Please enter a valid email address" },
                })}
              />
              {errors.email && <p className="label text-error">{errors.email.message}</p>}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Password</legend>
              <PasswordInput
                placeholder="Enter your password"
                autoComplete="current-password"
                hasError={!!errors.password}
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && <p className="label text-error">{errors.password.message}</p>}
            </fieldset>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted">
            New to Vybely?{" "}
            <Link href="/register" className="font-semibold text-info hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
