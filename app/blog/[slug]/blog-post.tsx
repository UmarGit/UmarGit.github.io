"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github.css";
import type { Components } from "react-markdown";
import ReadingProgress from "@/components/reading-progress";
import type { BlogPost } from "@/lib/mdx";

interface BlogPostProps {
  post: BlogPost;
}

export default function BlogPost({ post }: BlogPostProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(1);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const components: Components = {
    code({ node, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");

      // Improved code string extraction
      const getCodeString = (node: any, children: any) => {
        // Direct string in node value
        if (node?.children?.[0]?.value) {
          return node.children[0].value;
        }

        // Handle children array with potential nested objects
        if (Array.isArray(children)) {
          return children
            .map((child) =>
              typeof child === "string" ? child : child?.props?.children || ""
            )
            .join("");
        }

        // Single child
        if (children?.props?.children) {
          return Array.isArray(children.props.children)
            ? children.props.children.join("")
            : children.props.children;
        }

        // Fallback
        return String(children || "");
      };

      const codeString = getCodeString(node, children);

      if (match) {
        return (
          <div className="relative group my-8">
            <div className="bg-gray-50 bg-opacity-50 border border-gray-100 rounded-lg">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                <span className="text-xs text-gray-500 font-mono">
                  {match[1]}
                </span>
              </div>
              <div className="relative">
                <pre className="!m-0 !bg-transparent">
                  <code
                    className={`language-${match[1]} !bg-transparent`}
                    {...props}
                  >
                    {children}
                  </code>
                </pre>
                <button
                  onClick={() => handleCopyCode(codeString)}
                  className="absolute top-3 right-3 p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                  title="Copy code"
                >
                  {copiedIndex ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      }
      // Inline code
      return (
        <code className="bg-gray-100 text-gray-900 px-1 py-0.5 rounded font-mono text-sm">
          {children}
        </code>
      );
    },
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <ReadingProgress />

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto px-6 pt-8"
      >
        <Link
          href="/"
          className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors text-sm font-light"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
      </motion.div>

      {/* Article */}
      <article className="max-w-2xl mx-auto px-6 py-8">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <span className="font-light">
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="font-light">•</span>
              <span className="font-light">{post.readTime}</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-6">
              {post.tags.map((tag: string, index: number) => (
                <span key={tag} className="text-sm text-gray-500 font-light">
                  <span className="border border-neutral-100 bg-neutral-50 px-1 py-[1px] rounded-sm">
                    {tag}
                  </span>
                  {index < post.tags.length - 1 && ", "}
                </span>
              ))}
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-light mb-4 leading-tight text-gray-900 tracking-tight">
            {post.title}
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed font-light">
            {post.description}
          </p>

          <div className="border-t border-gray-100 my-6"></div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="prose prose-lg max-w-none prose-pre:!p-0 prose-pre:!m-0 prose-pre:!bg-transparent"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={components}
          >
            {post.content}
          </ReactMarkdown>
        </motion.div>

        {/* Author section */}
        {post.author && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 pt-8 border-t border-gray-100"
          >
            <div className="flex items-center space-x-4">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-medium text-sm">
                  {post.author.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="font-light text-gray-900">{post.author.name}</h3>
                {post.author.title && (
                  <p className="text-gray-600 text-sm font-light">
                    {post.author.title}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </article>
    </div>
  );
}
