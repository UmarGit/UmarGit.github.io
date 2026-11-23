import { shareCard } from "@/lib/og";

// Served as /og/home.png (a real .png path, so GitHub Pages sends image/png).
export const dynamic = "force-static";

export function GET() {
  return shareCard({
    kicker: "software engineer · ml researcher",
    title: "Hi, I'm Umar Ahmed",
    meta: "software engineering · machine learning · quantum computing",
  });
}
