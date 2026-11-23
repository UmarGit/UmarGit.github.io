import { getAllPosts, getPostBySlug } from "@/lib/mdx";
import { shareCard } from "@/lib/og";

// Served as /og/<slug>/card.png (a real .png path, so GitHub Pages sends image/png).
export const dynamic = "force-static";

export async function generateStaticParams() {
  return (await getAllPosts()).map((p) => ({ slug: p.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return shareCard({
    kicker: post ? `${post.date} · ${post.readTime}` : "",
    title: post?.title ?? "Lab notebook",
    meta: post?.citation
      ? `arXiv:${post.citation.arxiv}`
      : post?.tags.slice(0, 3).map((t) => `#${t.replace(/\s+/g, "-")}`).join("  "),
    tags: post?.tags,
  });
}
