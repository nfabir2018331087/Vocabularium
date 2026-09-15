const BASE_URL = "https://vocabularium.vercel.app";

// Only routes that are reachable without signing in are worth indexing —
// everything else (profile, inbox, friends, story generator, etc.) sits
// behind auth and has nothing useful to show a crawler.
const ROUTES = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/add", priority: 0.7, changeFrequency: "monthly" },
  { path: "/words", priority: 0.7, changeFrequency: "monthly" },
  { path: "/quiz", priority: 0.7, changeFrequency: "monthly" },
  { path: "/progress", priority: 0.6, changeFrequency: "monthly" },
];

export default function sitemap() {
  const lastModified = new Date();
  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
