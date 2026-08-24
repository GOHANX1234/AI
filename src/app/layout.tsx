import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "ClerX",
  description: "ClerX AI - Conversational intelligence workspace with instant reasoning, code execution, and cloud memory.",
  keywords: ["AI Chat", "ClerX", "ClerX AI", "Conversational AI", "Coding Assistant", "Productivity Workspace"],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="bg-[#000000] text-[#ececec] min-h-screen antialiased selection:bg-white selection:text-black">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
