import { Geist, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import BottomNav from "./components/BottomNav";
import ThemeProvider from "./components/ThemeProvider";
import AuthProvider from "./components/AuthProvider";
import BackgroundPrefetch from "./components/BackgroundPrefetch";
import OfflineIndicator from "./components/OfflineIndicator";
import { SerwistProvider } from "@serwist/next/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoBangla = Noto_Sans_Bengali({
  variable: "--font-bangla",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = "https://vocabularium.vercel.app";
const SITE_DESCRIPTION =
  "Build your personal vocabulary with AI-assisted word entries, practice with quizzes, and turn your words into AI-generated stories.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vocabularium — Personal Vocabulary Builder",
    template: "%s — Vocabularium",
  },
  description: SITE_DESCRIPTION,
  keywords: ["vocabulary builder", "vocabulary app", "word quiz", "flashcards", "learn english words", "vocabulary trainer"],
  manifest: "/manifest.json",
  verification: {
    google: "Xo6VjNApbrRt4IkOyDt-UCY7pheqNVldM6w_2tV-ids",
  },
  openGraph: {
    title: "Vocabularium",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Vocabularium",
    images: [{ url: "/icon-512.png" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Vocabularium",
    description: SITE_DESCRIPTION,
    images: ["/icon-512.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6366f1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var t = localStorage.getItem('theme');
                var d = document.documentElement;
                if (t === 'dark') d.classList.add('dark');
                else if (t === 'light') d.classList.remove('dark');
                else if (window.matchMedia('(prefers-color-scheme: dark)').matches) d.classList.add('dark');
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${notoBangla.variable} antialiased`} suppressHydrationWarning>
        <SerwistProvider swUrl="/sw.js" reloadOnOnline={false}>
          <ThemeProvider>
            <AuthProvider initialUser={null}>
              <OfflineIndicator />
              <main className="max-w-lg mx-auto px-4 py-6 animate-fade-in">
                {children}
              </main>
              <BackgroundPrefetch />
              <BottomNav />
            </AuthProvider>
          </ThemeProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
