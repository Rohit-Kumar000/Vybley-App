import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "./components/Providers";
import Header from "./components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Vybely - Share your vibe",
    template: "%s | Vybely",
  },
  description: "Vybely is a short-video community. Upload reels, discover creators and like what you love.",
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="vybely" className={geistSans.variable}>
      <body className="flex min-h-screen flex-col bg-base-100 font-sans text-base-content antialiased">
        <Providers>
          <div className="ambient" aria-hidden />
          <Header />

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>

          <footer className="footer footer-center border-t border-line p-6 text-xs text-muted">
            <p>
              &copy; {new Date().getFullYear()} Vybely. Made with Rohit
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
