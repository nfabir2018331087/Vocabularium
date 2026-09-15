const BASE_URL = "https://vocabularium.vercel.app";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/profile/",
        "/friends/",
        "/friend-requests/",
        "/inbox/",
        "/learning-tracker/",
        "/story-generator/",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
