import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/toast";
import { BackgroundBlobs } from "@/components/ui/background-blobs";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FitCenter",
    template: "%s | FitCenter",
  },
  description: "피트니스 센터 PT 예약 및 관리 시스템",
  applicationName: "FitCenter",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f0f0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full antialiased">
        <BackgroundBlobs />
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(23, 23, 23, 0.95)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#f8fafc",
            },
          }}
        />
      </body>
    </html>
  );
}
