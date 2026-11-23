import type React from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/analytics";
import Buddy from "@/components/buddy/Buddy";
import PullCord from "@/components/buddy/PullCord";
import { themeInitScript } from "@/lib/theme";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://umargit.github.io"),
  title: { default: "Umar Ahmed · Lab notebook", template: "%s · Umar Ahmed" },
  description:
    "Umar Ahmed writes about software engineering, machine learning, data science, and quantum computing.",
  openGraph: {
    type: "website",
    siteName: "Umar Ahmed · Lab notebook",
    images: [{ url: "/og/home.png", width: 1200, height: 630, alt: "Umar Ahmed · Lab notebook" }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.png"] },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
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
