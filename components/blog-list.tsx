import Link from "next/link";
import type { BlogPost } from "@/lib/mdx";
import PixelIcon from "@/components/pixel-icon";

/** The notebook index: one dashed "shelf" per entry, like a paper listing. */
export default function BlogList({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return <p className="py-12 text-center font-serif text-gray-600">No entries yet.</p>;
  }

  return (
    <ol>
      {posts.map((post) => (
        <li
          key={post.slug}
          className="pixel-shelf group first:before:hidden"
          data-buddy-perch
          data-buddy-topics={post.tags.map((t) => t.toLowerCase()).join("|")}
        >
          <Link
            href={`/blog/${post.slug}`}
            className="-mx-3 grid grid-cols-1 gap-x-8 gap-y-2 rounded-md px-3 py-7 transition-colors hover:bg-gray-50 sm:grid-cols-[6.5rem_1fr_auto]"
          >
            <time dateTime={post.date} className="pt-1 font-mono text-xs text-gray-500">
              {post.date}
            </time>
            <div className="min-w-0">
              <h3 className="flex items-start gap-3 font-serif text-[1.4rem] leading-snug text-gray-900 transition-colors group-hover:text-accent">
                <PixelIcon tags={post.tags} size={18} className="mt-1.5 text-gray-700" />
                <span>{post.title}</span>
              </h3>
              <p className="mt-2 line-clamp-2 text-[0.95rem] leading-relaxed text-gray-600">{post.description}</p>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-gray-500">
                {post.tags.slice(0, 4).map((tag) => (
                  <span key={tag}>#{tag.toLowerCase().replace(/\s+/g, "-")}</span>
                ))}
              </div>
            </div>
            <span className="hidden whitespace-nowrap pt-1 font-mono text-xs text-gray-500 sm:block">
              {post.readTime}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
