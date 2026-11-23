"use client";

import React, { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { Components } from "react-markdown";
import ReadingProgress from "@/components/reading-progress";
import ImageLightbox from "@/components/image-lightbox";
import type { BlogPost as BlogPostType } from "@/lib/mdx";
import ShareButton from "@/components/share-button";
import PixelIcon from "@/components/pixel-icon";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Toc from "@/components/toc";
import { extractHeadings, slugify } from "@/lib/headings";

/** Plain text of a React subtree (for heading ids). */
function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

function CodeBlock({ lang, code, children }: { lang: string; code: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };
  return (
    <div className="group relative my-7 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <span className="font-mono text-[11px] text-gray-500">{lang}</span>
        <button
          onClick={copy}
          className="rounded p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 group-hover:opacity-100 focus:opacity-100"
          title="Copy code"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <pre className="m-0 overflow-x-auto bg-transparent">{children}</pre>
    </div>
  );
}

export default function BlogPost({ post }: { post: BlogPostType }) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string; originRect: DOMRect | null } | null>(null);
  const headings = useMemo(() => extractHeadings(post.content), [post.content]);

  const components: Components = {
    h2({ children }) {
      return <h2 id={slugify(textOf(children))}>{children}</h2>;
    },
    img({ src, alt }) {
      if (!src || typeof src !== "string") return null;
      return (
        <img
          src={src}
          alt={alt || ""}
          loading="lazy"
          className="cursor-zoom-in"
          onClick={(e) => setLightbox({ src, alt: alt || "", originRect: e.currentTarget.getBoundingClientRect() })}
        />
      );
    },
    p({ children }) {
      // A paragraph holding only an image becomes a numbered figure.
      const kids = React.Children.toArray(children);
      const only = kids.length === 1 ? kids[0] : null;
      if (React.isValidElement<{ alt?: string }>(only) && (only.type === "img" || only.props.alt !== undefined)) {
        return (
          <figure className="figure my-9">
            {only}
            {only.props.alt && <figcaption className="figure-caption">{only.props.alt}</figcaption>}
          </figure>
        );
      }
      return <p>{children}</p>;
    },
    pre({ children }) {
      const child = React.Children.only(children) as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
      const lang = /language-(\w+)/.exec(child.props.className || "")?.[1] ?? "text";
      return (
        <CodeBlock lang={lang} code={textOf(child.props.children)}>
          {children}
        </CodeBlock>
      );
    },
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <ReadingProgress />
      {/* Extra top room on small screens: Qubi hangs from the progress bar there. */}
      <div className="pt-12 lg:pt-0">
        <SiteHeader back wide />
      </div>

      {/* Wide screens: a 48rem reading column plus the contents sidebar, aligned with the header. */}
      <div className="mx-auto max-w-3xl px-6 xl:grid xl:max-w-[67rem] xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-16">
        <article
          className="min-w-0 pt-14 sm:pt-20"
          data-buddy-topics={post.tags.map((t) => t.toLowerCase()).join("|")}
        >
          <header>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-gray-500">
              <PixelIcon tags={post.tags} size={16} className="text-gray-700" />
              <time dateTime={post.date}>{post.date}</time>
              <span aria-hidden>·</span>
              <span>{post.readTime}</span>
            </div>
            <h1 className="mt-6 font-serif text-[2.2rem] leading-[1.1] tracking-tight text-gray-900 sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-6 font-serif text-xl italic leading-relaxed text-gray-600">{post.description}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-gray-500">
              {post.author && <span className="text-gray-900">{post.author.name}</span>}
              {post.tags.map((tag) => (
                <span key={tag}>#{tag.toLowerCase().replace(/\s+/g, "-")}</span>
              ))}
            </div>
            {post.links.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {post.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="paper-button">
                    {l.label} <span aria-hidden>↗</span>
                  </a>
                ))}
              </div>
            )}
            <div className="mt-10 border-t border-dashed border-gray-300" />
          </header>

          <div className="prose mt-10">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeHighlight]} components={components}>
              {post.content}
            </ReactMarkdown>
          </div>

          <footer className="mt-16 flex flex-col gap-6 border-t border-dashed border-gray-300 pt-8 sm:flex-row sm:items-center sm:justify-between">
            {post.author && (
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gray-900 font-serif text-lg text-white">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <p className="font-serif text-lg text-gray-900">{post.author.name}</p>
                  {post.author.title && <p className="font-mono text-xs text-gray-500">{post.author.title}</p>}
                </div>
              </div>
            )}
            <ShareButton title={post.title} />
          </footer>
        </article>

        <aside className="hidden pt-20 xl:block">
          <Toc headings={headings} />
        </aside>
      </div>

      <SiteFooter />

      <ImageLightbox
        src={lightbox?.src || ""}
        alt={lightbox?.alt || ""}
        isOpen={!!lightbox}
        onClose={() => setLightbox(null)}
        originRect={lightbox?.originRect}
      />
    </div>
  );
}
