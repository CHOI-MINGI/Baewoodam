import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "배우담",
  description: "배우와 에이전시를 잇는 캐스팅 플랫폼",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "배우담",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1A1A2E",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
