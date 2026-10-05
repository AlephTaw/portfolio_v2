import type { Metadata, Viewport } from "next";
import { PwaRegistration } from "./components/pwa-registration";
import { Watcher } from "./components/watcher/watcher";
import "./globals.css";

export const metadata: Metadata = {
  title: "Speedrun IRL",
  description: "Welcome to the game of life. Mobile-first edition.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Speedrun IRL" },
  icons: { icon: "/icons/app.svg", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#02010f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Watcher>{children}<PwaRegistration /></Watcher></body></html>;
}
