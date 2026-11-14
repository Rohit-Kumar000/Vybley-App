"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { UserPlus } from "lucide-react";
import { useNotification } from "../components/Notification";
import PasswordInput from "../components/PasswordInput";

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const router = useRouter();
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ defaultValues: { email: "", password: "", confirmPassword: "" } });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email.trim().toLowerCase(), password: data.password }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || "Registration failed");
      }

      showNotification("Account created! Please log in.", "success");
      router.push("/login");
    } catch (error) {
      showNotification(error instanceof Error ? error.message : "Registration failed", "error");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md py-6">
      <div className="card border border-line bg-base-200 shadow-2xl shadow-primary/10">
        <div className="card-body gap-6 p-8">
          <div className="text-center">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-primary to-accent shadow-lg shadow-primary/40">
              <UserPlus className="h-6 w-6 text-white" />
            </span>
            <h1 className="text-2xl font-extrabold">Create your account</h1>
            <p className="mt-1 text-sm text-muted">Join Vybely and start sharing your moments.</p>
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
                placeholder="Create a password"
                autoComplete="new-password"
                hasError={!!errors.password}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters long" },
                  maxLength: { value: 72, message: "Password is too long (max 72 characters)" },
                })}
              />
              {errors.password ? (
                <p className="label text-error">{errors.password.message}</p>
              ) : (
                <p className="label text-muted">Minimum 8 characters.</p>
              )}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Confirm password</legend>
              <PasswordInput
                placeholder="Repeat your password"
                autoComplete="new-password"
                hasError={!!errors.confirmPassword}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value, formValues) => value === formValues.password || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && <p className="label text-error">{errors.confirmPassword.message}</p>}
            </fieldset>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-info hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
