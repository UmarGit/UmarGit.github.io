import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/mdx";
import BlogPost from "./blog-post";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-5 h-5 border border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
        </div>
      }
    >
      <BlogPost post={post} />
    </Suspense>
  );
}
