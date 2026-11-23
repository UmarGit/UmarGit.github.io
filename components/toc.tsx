"use client";

import { useEffect, useState } from "react";

/** Sticky contents list; highlights the section you're reading. */
export default function Toc({ headings }: { headings: { id: string; text: string }[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => !!el);
    const onScroll = () => {
      let current: string | null = null;
      for (const el of els) if (el.getBoundingClientRect().top < 140) current = el.id;
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav aria-label="Contents" className="sticky top-16">
      <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500">Contents</p>
      <ol className="space-y-2 border-l border-gray-200 text-[13px] leading-snug">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`-ml-px block border-l py-0.5 pl-3 transition-colors ${
                active === h.id
                  ? "border-accent text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
