import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HackersHarbor — Navigate Your Coding Journey",
  description: "Learn software engineering, practice coding challenges, build real projects and get hired. HackersHarbor is the all-in-one developer learning platform built in India.",
  keywords: "learn coding, software engineering, coding challenges, programming, Python, SQL, DSA, web development, India",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

icons: {
  icon: [
    { url: "/favicon.ico", sizes: "any" },
    { url: "/logo.png", type: "image/png" },
  ],
  apple: "/logo.png",
},