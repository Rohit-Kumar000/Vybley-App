"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { CloudUpload, House, LogOut, Play, User } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: House },
  { href: "/upload", label: "Upload", icon: CloudUpload },
];

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the account menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const onClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const name = session?.user?.email?.split("@")[0] ?? "";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-base-100/80 backdrop-blur-xl">
      <div className="navbar mx-auto max-w-6xl px-4 sm:px-6">
        <div className="navbar-start">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-primary to-accent shadow-lg shadow-primary/40">
              <Play className="h-4 w-4 fill-white text-white" />
            </span>
            <span className="text-gradient text-xl font-extrabold tracking-tight">Vybely</span>
          </Link>
        </div>

        <nav className="navbar-center hidden sm:flex" aria-label="Main">
          <ul className="menu menu-horizontal gap-1 p-0">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;

              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={active ? "bg-info/10 text-info" : "text-muted"}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="navbar-end gap-2">
          {status === "loading" ? (
            <div className="skeleton h-9 w-9 rounded-full" />
          ) : session ? (
            <>
              <Link href="/upload" className="btn btn-primary btn-sm hidden sm:inline-flex">
                <CloudUpload className="h-4 w-4" />
                New reel
              </Link>

              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  aria-label="Open account menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                  className="avatar avatar-placeholder cursor-pointer"
                >
                  <div className="w-9 rounded-full bg-linear-to-br from-secondary to-accent text-sm font-bold text-white ring-2 ring-transparent transition hover:ring-secondary/50">
                    <span>{name.charAt(0).toUpperCase() || "U"}</span>
                  </div>
                </button>

                {menuOpen && (
                  <ul className="menu absolute right-0 z-50 mt-3 w-60 animate-toast-in rounded-box border border-line bg-base-200 p-2 shadow-2xl shadow-black/50">
                    <li className="pointer-events-none px-3 py-2">
                      <div className="flex flex-col items-start gap-0 p-0">
                        <span className="max-w-full truncate text-sm font-semibold">{name}</span>
                        <span className="max-w-full truncate text-xs text-muted">{session.user?.email}</span>
                      </div>
                    </li>

                    <li>
                      <Link href="/profile" onClick={() => setMenuOpen(false)}>
                        <User className="h-4 w-4 text-secondary" />
                        My profile
                      </Link>
                    </li>

                    <li className="sm:hidden">
                      <Link href="/upload" onClick={() => setMenuOpen(false)}>
                        <CloudUpload className="h-4 w-4 text-info" />
                        Upload video
                      </Link>
                    </li>

                    <li>
                      <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="text-error">
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
