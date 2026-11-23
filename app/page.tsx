import { getAllPosts } from "@/lib/mdx";
import BlogList from "@/components/blog-list";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-6">
        <section className="pt-20 pb-16 sm:pt-28">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500">
            Software engineer · ML researcher
          </p>
          <h1 className="font-serif text-[2.6rem] leading-[1.05] tracking-tight text-gray-900 sm:text-6xl">
            {/* Qubi stands right after this span. */}
            <span data-buddy-home>Hi, I&apos;m Umar Ahmed</span>
          </h1>
          <p className="mt-6 max-w-xl font-serif text-xl leading-relaxed text-gray-600 sm:text-[1.4rem]">
            I write about software engineering, machine learning, data science, and quantum computing.
          </p>
        </section>

        <section aria-labelledby="notebook">
          <div className="flex items-baseline justify-between border-b border-gray-900 pb-3">
            <h2 id="notebook" className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-900">
              Lab notebook
            </h2>
            <span className="font-mono text-[11px] text-gray-500">
              {posts.length} {posts.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          <BlogList posts={posts} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
