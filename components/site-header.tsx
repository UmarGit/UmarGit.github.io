import Link from "next/link";

const LINKS = [
  { label: "github", href: "https://github.com/UmarGit" },
  { label: "hugging face", href: "https://huggingface.co/umarsheikh303" },
  { label: "linkedin", href: "https://linkedin.com/in/umarsheikh303" },
];

/** Top bar: the notebook's running head. */
export default function SiteHeader({ back = false, wide = false }: { back?: boolean; wide?: boolean }) {
  return (
    <header
      className={`mx-auto flex max-w-3xl items-center ${wide ? "xl:max-w-[67rem]" : ""} justify-between gap-6 px-6 pt-8 font-mono text-xs text-gray-500`}
    >
      <Link href="/" className="group text-gray-900">
        {back && <span className="mr-2 text-gray-400 transition-colors group-hover:text-accent">←</span>}
        umar ahmed
        <span className="text-gray-400"> / lab notebook</span>
      </Link>
      {/* Right margin keeps clear of the pull cord. */}
      <nav className="mr-8 hidden gap-5 sm:flex">
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
