/** Strip leading emoji/symbols: "📌 The Idea" → "The Idea". */
export const cleanHeading = (text: string) => text.replace(/^[^\p{L}\p{N}]+/u, "").trim();

export const slugify = (text: string) =>
  cleanHeading(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

/** The post's "## " headings, skipping fenced code blocks. */
export function extractHeadings(markdown: string): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const m = /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) out.push({ id: slugify(m[1]), text: cleanHeading(m[1]) });
  }
  return out;
}
