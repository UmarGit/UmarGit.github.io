"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowUpRight, Dot } from "lucide-react"
import { useState } from "react"
import type { BlogPost } from "@/lib/mdx"

interface BlogListProps {
  posts: BlogPost[]
}

export default function BlogList({ posts }: BlogListProps) {
  const [hoveredPost, setHoveredPost] = useState<string | null>(null)

  if (posts.length === 0) {
    return <p className="text-gray-600 text-center py-12 font-light">No posts found.</p>
  }

  return (
    <div className="space-y-2">
      {posts.map((post, index) => (
        <motion.article
          key={post.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="group"
          onMouseEnter={() => setHoveredPost(post.slug)}
          onMouseLeave={() => setHoveredPost(null)}
        >
          <Link href={`/blog/${post.slug}`}>
            <div className="py-6 px-4 -mx-4 hover:bg-gray-50/80 rounded-lg transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2 space-x-2 text-sm text-gray-500">
                    <span className="font-light">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <Dot className="w-3 h-3" />
                    <span className="font-light">{post.readTime}</span>
                  </div>

                  <h2 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors leading-snug">
                    {post.title}
                  </h2>

                  <p className="text-gray-600 leading-relaxed font-light text-sm mb-3">{post.description}</p>

                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-gray-500 font-light border border-gray-200 bg-gray-50 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && <span className="text-xs text-gray-400">+{post.tags.length - 3}</span>}
                  </div>
                </div>
                <motion.div
                  animate={{
                    x: hoveredPost === post.slug ? 2 : 0,
                    y: hoveredPost === post.slug ? -2 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors ml-6 flex-shrink-0" />
                </motion.div>
              </div>
            </div>
          </Link>
        </motion.article>
      ))}
    </div>
  )
}
