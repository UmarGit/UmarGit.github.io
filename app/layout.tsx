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
  title: { default: "Umar Ahmed · Lab notebook", template: "%s · Umar Ahmed" },
  description:
    "Umar Ahmed writes about software engineering, machine learning, data science, and quantum computing.",
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
