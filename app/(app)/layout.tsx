import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SerwistProvider } from "@serwist/turbopack/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NextTopLoader from "nextjs-toploader";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { PwaUpdatePrompt } from "@/components/pwa/update-prompt";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { META_THEME_COLORS } from "@/hooks/use-meta-color";
import { inter } from "@/lib/fonts";
import { buildSiteMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildSiteMetadata(),
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  interactiveWidget: "resizes-content",
  viewportFit: "cover",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* <script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        /> */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: safe here
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
          }}
        />
        <meta name="theme-color" content={META_THEME_COLORS.light} />
      </head>
      <body className={`${inter.className} ${inter.variable} antialiased`}>
        <ThemeProvider>
          <SerwistProvider
            cacheOnNavigation={false}
            disable={process.env.NODE_ENV !== "production"}
            reloadOnOnline={false}
            swUrl="/serwist/sw.js"
          >
            <NextTopLoader
              color="#4e65ff"
              shadow="0 0 20px #4e65ff, 0 0 40px #4e65ff, 0 0 60px #4e65ff"
              showSpinner={false}
              showForHashAnchor={false}
            />
            {children}
            <OfflineIndicator />
            <PwaUpdatePrompt />
            <Toaster />
            <GoogleAnalytics gaId="G-SYM2633LQY" />
            <SpeedInsights />
          </SerwistProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
