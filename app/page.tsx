export default function Home() {
  return (
    <div className="w-screen h-full pt-4 overflow-hidden">
      <main className="w-full h-full mx-auto max-w-4xl">
        <div className="w-full flex relative">
          <section>
            <div className="text-8xl text-neutral-300 h-[calc(100%-16px)] pt-3 flex flex-col justify-between">
              <div className="pointer-events-none select-none bg-neutral-300 mx-auto mr-4 flex items-center justify-center rounded-full w-12 h-12 text-2xl text-neutral-900">
                U
              </div>
              <div className="pointer-events-none select-none header-text mr-2">
                iam umar
              </div>
            </div>
          </section>
          <section className="flex-1 px-4 pt-4 border-l border-t rounded-tl-lg border-neutral-400 h-[calc(100vh-16px)]">
            <div className="overflow-auto hide-scrollbar h-full flex flex-col justify-between">
              <div className="text-lg text-neutral-300">
                <p className="mb-4">
                  <strong>Senior Software Engineer</strong> with a flair for
                  simplifying complexity.
                </p>
                <p className="mb-4">
                  <strong>Currently:</strong> Pursuing a Master's in Big Data &
                  Machine Learning at ITMO University.
                </p>
                <p>
                  <strong>Previously:</strong> Led scalable innovations at
                  Aeroglobe and digital transformations at Webnorth.
                </p>
              </div>
              <div className="text-sm text-neutral-500 mb-4">
                <p>Contact: umarsheikh303@gmail.com | +7 999 217 24 11</p>
                <p>
                  Find me on LinkedIn:{" "}
                  <a
                    href="https://linkedin.com/in/umarsheikh303"
                    className="underline"
                  >
                    /in/umarsheikh303
                  </a>
                </p>
                <footer className="text-neutral-500 mt-2">
                  <small>
                    &copy; {new Date().getFullYear()} Umar Ahmed. All rights
                    reserved.
                  </small>
                </footer>
              </div>
            </div>
          </section>
          <section className="absolute border-t border-neutral-400 w-full -right-full"></section>
        </div>
      </main>
    </div>
  );
}
