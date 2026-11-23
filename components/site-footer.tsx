/** Footer: colophon, with a hint about Qubi. */
export default function SiteFooter() {
  return (
    <footer className="mx-auto mt-24 max-w-3xl px-6 pb-12">
      <div className="flex flex-col gap-3 border-t border-dashed border-gray-300 pt-6 font-mono text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-5">
          <span>© {new Date().getFullYear()} Umar Ahmed</span>
          <a href="mailto:umarsheikh303@gmail.com" className="transition-colors hover:text-accent">
            email
          </a>
          <a
            href="https://linkedin.com/in/umarsheikh303"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            linkedin
          </a>
        </div>
        <span className="text-gray-400">Qubi lives here. Double-click it ✦</span>
      </div>
    </footer>
  );
}
