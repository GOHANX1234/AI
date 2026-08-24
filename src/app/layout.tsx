import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://clerx-ai.vercel.app"),
  title: {
    default: "ClerX AI — Modern Neural Assistant & Intelligent Chat Workspace",
    template: "%s | ClerX AI",
  },
  description:
    "High-performance AI chat workspace powered by deep reasoning, code execution, PDF & photo intelligence, and persistent cloud memory.",
  applicationName: "ClerX AI",
  authors: [{ name: "ClerX AI Team", url: "https://clerx-ai.vercel.app" }],
  generator: "Next.js",
  keywords: [
    "ClerX",
    "ClerX AI",
    "AI Chat",
    "Neural Workspace",
    "AI Assistant",
    "DeepSeek",
    "ChatGPT Alternative",
    "Coding Assistant",
    "PDF Analysis",
    "Multimodal AI",
    "Prompt Engineering",
    "OpenRouter",
  ],
  creator: "ClerX AI",
  publisher: "ClerX AI Inc.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://clerx-ai.vercel.app",
    siteName: "ClerX AI",
    title: "ClerX AI — Modern Neural Assistant & Intelligent Chat Workspace",
    description:
      "High-performance AI chat workspace powered by deep reasoning, code execution, PDF & photo intelligence, and persistent cloud memory.",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "ClerX AI Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClerX AI — Modern Neural Assistant & Intelligent Chat Workspace",
    description:
      "High-performance AI chat workspace powered by deep reasoning, code execution, PDF & photo intelligence, and persistent cloud memory.",
    images: ["/icon.svg"],
    creator: "@ClerXAI",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  category: "technology",
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
