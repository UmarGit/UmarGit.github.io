/**
 * What this visitor has read, remembered in their own browser only
 * (localStorage; nothing is sent anywhere). Every access is guarded: in a
 * private window storage may be missing and the site must still work.
 */
const READ = "notebook:read";
const LAST = "notebook:lastVisit";
const PREV = "notebook:prevVisit"; // sessionStorage: the visit before this session

const get = (store: Storage | undefined, key: string): string | null => {
  try {
    return store?.getItem(key) ?? null;
  } catch {
    return null;
  }
};
const set = (store: Storage | undefined, key: string, value: string) => {
  try {
    store?.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
};
const local = () => (typeof window === "undefined" ? undefined : window.localStorage);
const session = () => (typeof window === "undefined" ? undefined : window.sessionStorage);

export function readSlugs(): Set<string> {
  try {
    return new Set(JSON.parse(get(local(), READ) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

export function markRead(slug: string) {
  const s = readSlugs();
  s.add(slug);
  set(local(), READ, JSON.stringify([...s]));
  window.dispatchEvent(new CustomEvent("notebook:read", { detail: slug }));
}

/**
 * Time (ms) of this visitor's previous visit, or null on a first visit.
 * The first call in a browser session moves "last visit" forward to now and
 * remembers the old value for the rest of the session.
 */
export function previousVisit(): number | null {
  const ss = session();
  const cached = get(ss, PREV);
  if (cached !== null) return cached === "" ? null : Number(cached);
  const last = get(local(), LAST);
  set(ss, PREV, last ?? "");
  set(local(), LAST, String(Date.now()));
  return last ? Number(last) : null;
}
