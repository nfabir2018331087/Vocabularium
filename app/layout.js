import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import BottomNav from "./components/BottomNav";
import ThemeProvider from "./components/ThemeProvider";
import AuthProvider from "./components/AuthProvider";
import { getSupabaseUser } from "../lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoBangla = Noto_Sans_Bengali({
  variable: "--font-bangla",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Vocabularium",
  description: "Your personal vocabulary builder",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#6366f1",
};

export default async function RootLayout({ children }) {
  const user = await getSupabaseUser();

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
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoBangla.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider initialUser={user}>
            <main className="max-w-lg mx-auto px-4 py-6 animate-fade-in">
              {children}
            </main>
            <BottomNav />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
