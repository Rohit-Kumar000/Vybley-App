"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = Omit<ComponentProps<"input">, "type"> & { hasError?: boolean };

// Password field with a show/hide toggle. Works with react-hook-form's `register`
// because `ref` is passed down as a normal prop in React 19.
export default function PasswordInput({ hasError, className = "", ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`input w-full pr-12 ${hasError ? "input-error" : ""} ${className}`}
      />

      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="btn btn-ghost btn-xs btn-circle absolute top-1/2 right-2 -translate-y-1/2 text-muted"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
