import { Suspense } from "react"
import { getAllPosts } from "@/lib/mdx"
import BlogList from "@/components/blog-list"

export default async function Home() {
  const posts = await getAllPosts()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero section */}
      <header className="max-w-2xl mx-auto px-6 pt-16 pb-12 w-full">
        <h1 className="text-2xl md:text-3xl font-light text-gray-900 mb-4 leading-tight tracking-tight">
          Hi, I'm Umar Ahmed
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed font-light">
          I write about software engineering, machine learning, data science, and quantum computing.
        </p>
      </header>

      {/* Blog posts */}
      <main className="max-w-2xl mx-auto px-6 pb-16 w-full min-h-[calc(100vh-300px)]">
        <h2 className="text-xl font-light text-gray-900 mb-8">Recent Posts</h2>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
            </div>
          }
        >
          <BlogList posts={posts} />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto p-6 border-t border-gray-100 w-full">
        <div className="flex flex-row justify-between items-start space-y-4 md:space-y-0">
          <div>
            <div className="flex space-x-4 text-sm">
              <a
                href="mailto:umarsheikh303@gmail.com"
                className="text-gray-500 hover:text-gray-700 transition-colors font-light"
              >
                Email
              </a>
              <a
                href="https://linkedin.com/in/umarsheikh303"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-colors font-light"
              >
                LinkedIn
              </a>
            </div>
          </div>

          <div className="text-right">
            <p className="text-gray-400 text-sm font-light">© {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
