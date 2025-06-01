import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logPageView, logBlogView } from "@/lib/firebase";

export function useAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Log general page view
    logPageView(pathname, document.title);

    // If it's a blog post, log specific blog view
    if (pathname.startsWith("/blog/")) {
      const slug = pathname.replace("/blog/", "");
      logBlogView(slug, document.title);
    }
  }, [pathname]);
}
