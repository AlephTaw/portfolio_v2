import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { SmoothScroll } from "./SmoothScroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "www.swilcox.dev";
  const isLocalHost =
    host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol = isLocalHost
    ? "http"
    : (requestHeaders.get("x-forwarded-proto") ?? "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const title = "Steven Wilcox - CV and Work";
  const description =
    "A clean public CV and compact presentation of Steven Wilcox's work.";

  return {
    metadataBase: baseUrl,
    title,
    description,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: baseUrl,
      images: [{ url: new URL("/og.png", baseUrl), width: 1664, height: 952 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [new URL("/og.png", baseUrl)],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
