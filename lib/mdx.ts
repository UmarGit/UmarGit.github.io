import matter from "gray-matter";
import { readFile, readdir } from "fs/promises";
import { join } from "path";

interface Author {
  name: string;
  title?: string;
  avatar?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string;
  readTime: string;
  author?: Author;
}

interface Frontmatter {
  title: string;
  description: string;
  date: string;
  tags: string[];
  author?: Author;
}

const BLOG_DIR = join(process.cwd(), "content/blog");

function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const files = await readdir(BLOG_DIR);
    const mdxFiles = files.filter(
      (file) => file.endsWith(".mdx") || file.endsWith(".md")
    );

    const posts = await Promise.all(
      mdxFiles.map(async (filename) => {
        const filePath = join(BLOG_DIR, filename);
        const fileContent = await readFile(filePath, "utf-8");

        const { data, content } = matter(fileContent);
        const frontmatter = data as Frontmatter;
        const slug = filename.replace(/\.(mdx?|md)$/, "");

        return {
          slug,
          title: frontmatter.title,
          description: frontmatter.description,
          date: frontmatter.date,
          tags: frontmatter.tags || [],
          content,
          readTime: calculateReadTime(content),
          author: frontmatter.author,
        };
      })
    );

    return posts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error("Error loading blog posts:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    let filePath: string;
    let fileContent: string;

    try {
      filePath = join(BLOG_DIR, `${slug}.mdx`);
      fileContent = await readFile(filePath, "utf-8");
    } catch {
      try {
        filePath = join(BLOG_DIR, `${slug}.md`);
        fileContent = await readFile(filePath, "utf-8");
      } catch {
        return null;
      }
    }

    const { data, content } = matter(fileContent);
    const frontmatter = data as Frontmatter;

    return {
      slug,
      title: frontmatter.title,
      description: frontmatter.description,
      date: frontmatter.date,
      tags: frontmatter.tags || [],
      content,
      readTime: calculateReadTime(content),
      author: frontmatter.author,
    };
  } catch (error) {
    console.error(`Error loading post ${slug}:`, error);
    return null;
  }
}
