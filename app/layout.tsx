import type { Metadata } from "next";
import { Courier_Prime } from "next/font/google"; // Using Courier Prime for that classic typewritter/spy feel
import "./globals.css";
import { GameProvider } from "@/context/GameContext";
import SoundController from "@/components/SoundController";

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Operation [NAME]",
  description: "Classified Intelligence Dossier - Unauthorized Access Prohibited",
  icons: {
    icon: [
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${courierPrime.variable} antialiased bg-slate-950 text-green-500 font-mono scanlines selection:bg-green-500 selection:text-black min-h-screen`}
      >
        <GameProvider>
          <div className="relative z-10 w-full min-h-screen">
            {children}
            <SoundController />
          </div>
          {/* Global CRT Overlay */}
          <div className="fixed inset-0 z-50 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20" />
          <div className="fixed inset-0 z-50 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />
        </GameProvider>
      </body>
    </html>
  );
}
