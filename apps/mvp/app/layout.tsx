import type { Metadata } from "next";
import { Bangers, Geist_Mono, Inter } from "next/font/google";
import { PrivateAppShell } from "./components/private-app-shell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bangers = Bangers({
  variable: "--font-bangers",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Speedrun IRL",
  description: "Welcome to the game of life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} ${bangers.variable} antialiased`}
      >
        <PrivateAppShell>{children}</PrivateAppShell>
      </body>
    </html>
  );
}
