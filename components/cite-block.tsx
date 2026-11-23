"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { Citation } from "@/lib/mdx";

/** "First Middle Last" → "Last, First Middle" (keeps "Al Awad" style surnames intact if given as last two words). */
function bibName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  // Treat a lowercase/particle or "Al" prefix as part of the surname.
  const i = parts.length >= 3 && /^(al|el|van|von|de|da|di|le)$/i.test(parts[parts.length - 2]) ? parts.length - 2 : parts.length - 1;
  return `${parts.slice(i).join(" ")}, ${parts.slice(0, i).join(" ")}`;
}

export function toBibtex(c: Citation): string {
  const fields: [string, string][] = [
    ["title", `{${c.title}}`],
    ["author", c.authors.map(bibName).join(" and ")],
    ["year", String(c.year)],
    ["eprint", c.arxiv],
    ["archivePrefix", "arXiv"],
    ...(c.primaryClass ? ([["primaryClass", c.primaryClass]] as [string, string][]) : []),
    ["url", `https://arxiv.org/abs/${c.arxiv}`],
  ];
  const width = Math.max(...fields.map(([k]) => k.length));
  return `@misc{${c.key},\n${fields.map(([k, v]) => `  ${k.padEnd(width)} = {${v}}`).join(",\n")}\n}`;
}

/** A plain one-line reference, e.g. "Ahmed, U., Dunaev, M., … (2026). Title. arXiv:…". */
function reference(c: Citation): string {
  const initials = (n: string) => {
    const [last, first] = bibName(n).split(", ");
    return `${last}, ${first.split(/\s+/).map((w) => `${w[0]}.`).join(" ")}`;
  };
  return `${c.authors.map(initials).join(", ")} (${c.year}). ${c.title}. arXiv:${c.arxiv}.`;
}

export default function CiteBlock({ citation }: { citation: Citation }) {
  const [copied, setCopied] = useState<"bib" | "ref" | null>(null);
  const bib = toBibtex(citation);

  const copy = async (what: "bib" | "ref") => {
    try {
      await navigator.clipboard.writeText(what === "bib" ? bib : reference(citation));
      setCopied(what);
      window.dispatchEvent(new CustomEvent("buddy:say", { detail: { text: what === "bib" ? "BibTeX copied! ✓" : "reference copied! ✓", expression: "happy" } }));
      setTimeout(() => setCopied(null), 1800);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <section aria-labelledby="cite" className="mt-16">
      <div className="flex items-baseline justify-between border-b border-gray-900 pb-3">
        <h2 id="cite" className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-900">
          Cite this
        </h2>
        <div className="flex gap-4 font-mono text-[11px] text-gray-500">
          <button onClick={() => copy("ref")} className="transition-colors hover:text-accent">
            {copied === "ref" ? "copied ✓" : "copy reference"}
          </button>
          <button onClick={() => copy("bib")} className="inline-flex items-center gap-1.5 transition-colors hover:text-accent">
            {copied === "bib" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied === "bib" ? "copied" : "copy bibtex"}
          </button>
        </div>
      </div>
      <p className="mt-4 font-serif text-[1.05rem] leading-relaxed text-gray-700">{reference(citation)}</p>
      <pre className="mt-4 overflow-x-auto rounded-md bg-gray-50 p-4 font-mono text-[12px] leading-relaxed text-gray-700">
        {bib}
      </pre>
    </section>
  );
}
