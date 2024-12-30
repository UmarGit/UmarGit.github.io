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
              <div className="text-md text-neutral-300 space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="text-xl font-semibold text-neutral-200 mb-2">
                    <span className="highlight text-red-400">import</span>{" "}
                    introduction{" "}
                    <span className="highlight text-red-400">from</span> life
                  </h3>
                  <p>
                    <strong>Senior Software Engineer</strong> with a knack for
                    breaking down complex systems into innovative, scalable
                    solutions. A relentless problem-solver driven by the pursuit
                    of excellence and measurable impact.{" "}
                    <code className="text-sm bg-neutral-200 bg-opacity-15 px-1 py-[1px] rounded-sm">
                      debug(this);
                    </code>
                  </p>
                </div>

                {/* Current Endeavors */}
                <div>
                  <h3 className="text-xl font-semibold text-neutral-200 mb-2">
                    <span className="highlight text-green-400">const</span>{" "}
                    Currently
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Pursuing a{" "}
                      <span className="text-green-400">Master's</span> in
                      <span className="highlight text-green-400">
                        Big Data
                      </span>{" "}
                      and
                      <span className="highlight text-green-400">
                        Machine Learning
                      </span>{" "}
                      at
                      <span className="highlight text-yellow-400">
                        ITMO University
                      </span>
                      .
                    </li>
                    <li>
                      <code className="text-sm bg-neutral-200 bg-opacity-15 px-1 py-[1px] rounded-sm">
                        tackleRealWorldChallenges()
                      </code>{" "}
                      with AI-driven solutions, bridging academia and practical
                      innovation.
                    </li>
                  </ul>
                </div>

                {/* Previous Experience */}
                <div>
                  <h3 className="text-xl font-semibold text-neutral-200 mb-2">
                    <span className="highlight text-blue-400">class</span>{" "}
                    Previously
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Transformed scalability and performance at
                      <span className="highlight text-blue-400">Aeroglobe</span>
                      , implementing lazy-loading to reduce load times by 90%.{" "}
                      <code className="text-sm bg-neutral-200 bg-opacity-15 px-1 py-[1px] rounded-sm">
                        optimize();
                      </code>
                    </li>
                    <li>
                      Spearheaded high-impact digital projects at
                      <span className="highlight text-green-400">Webnorth</span>
                      , developing solutions tailored for diverse user needs.{" "}
                      <code className="text-sm bg-neutral-200 bg-opacity-15 px-1 py-[1px] rounded-sm">
                        refactor(UX);
                      </code>
                    </li>
                  </ul>
                </div>

                {/* Key Accomplishments */}
                <div>
                  <h3 className="text-xl font-semibold text-neutral-200 mb-2">
                    <span className="highlight text-orange-400">fn</span> Key
                    Accomplishments
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Migrated a micro-frontend architecture to a monolith,
                      achieving a 30% improvement in maintainability.{" "}
                      <code className="text-sm bg-neutral-200 bg-opacity-15 px-1 py-[1px] rounded-sm">
                        cleanCode();
                      </code>
                    </li>
                    <li>
                      Reduced rendering times, ensuring a consistent 60fps
                      experience across applications.{" "}
                      <code className="text-sm bg-neutral-200 bg-opacity-15 px-1 py-[1px] rounded-sm">
                        optimizeRendering();
                      </code>
                    </li>
                    <li>
                      Delivered a medical database solution in Denmark,
                      revolutionizing accessibility for practitioners and
                      patients.{" "}
                      <code className="text-sm bg-neutral-200 bg-opacity-15 px-1 py-[1px] rounded-sm">
                        innovateHealthcare();
                      </code>
                    </li>
                  </ul>
                </div>

                {/* Languages and Countries */}
                <div>
                  <h3 className="text-xl font-semibold text-neutral-200 mb-2">
                    <span className="highlight text-purple-400">var</span>{" "}
                    Languages & Countries
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Languages:</strong> English, Russian, Arabic, Urdu
                    </li>
                    <li>
                      <strong>Countries I've Lived or Worked In:</strong>{" "}
                      Singapore, Doha, Abu Dhabi, Russia
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-sm text-neutral-500 mt-4 mb-16">
                <p>Contact: umarsheikh303@gmail.com | +7 999 217 24 11</p>
                <p>
                  Find me on LinkedIn:{" "}
                  <a
                    href="https://linkedin.com/in/umarsheikh303"
                    target="_blank"
                    rel="noopener noreferrer"
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

              <div className="w-full h-12 bg-gradient-to-b from-neutral-900 to-transparent absolute top-[1px]"></div>
              <div className="w-full h-24 bg-gradient-to-t from-neutral-900 to-transparent absolute bottom-0"></div>
            </div>
          </section>
          <section className="absolute border-t border-neutral-400 w-full -right-full"></section>
        </div>
      </main>
    </div>
  );
}
