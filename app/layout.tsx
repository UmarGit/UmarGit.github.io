import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/analytics";
import Buddy from "@/components/buddy/Buddy";
import PullCord from "@/components/buddy/PullCord";
import { themeInitScript } from "@/lib/theme";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iam umar",
  description: "introduction of umar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={interSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <PullCord />
        <Buddy />
        <Analytics />
      </body>
    </html>
  );
}
