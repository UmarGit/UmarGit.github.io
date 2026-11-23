"use client";

import { useEffect, useState } from "react";
import { previousVisit, readSlugs } from "@/lib/visits";

/** "✓ read" or "new" under a notebook entry's date, from this visitor's history. */
export default function ReadMark({ slug, date }: { slug: string; date: string }) {
  const [mark, setMark] = useState<"read" | "new" | null>(null);

  useEffect(() => {
    const update = () => {
      if (readSlugs().has(slug)) return setMark("read");
      const prev = previousVisit();
      setMark(prev !== null && Date.parse(date) > prev ? "new" : null);
    };
    update();
    window.addEventListener("notebook:read", update);
    return () => window.removeEventListener("notebook:read", update);
  }, [slug, date]);

  if (!mark) return null;
  return mark === "read" ? (
    <span className="mt-1 block font-mono text-[11px] text-gray-400">✓ read</span>
  ) : (
    <span className="mt-1 inline-block rounded-sm bg-accent-soft px-1.5 font-mono text-[11px] text-accent">new</span>
  );
}
