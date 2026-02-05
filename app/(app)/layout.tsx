import type { Metadata, Viewport } from "next";
import "@styles/globals.css";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { inter } from "@/lib/fonts";

export const metadata: Metadata = {
  title: {
    template: "%s | Math Course Online",
    default: "Math Course Online",
  },
  description: "Learn math online",
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    title: "Math Course",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    siteName: "Math Course Online",
    title: "Math Course Online",
    description: "Learn math online",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Math Course Online",
    description: "Learn math online",
  },
};

export const viewport: Viewport = {
  themeColor: "#4e65ff",
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  interactiveWidget: "resizes-content",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      {/* <head>
        <script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        />
      </head> */}
      <body className={`${inter.className} ${inter.variable} antialiased`}>
        <ThemeProvider>
          <NextTopLoader
            color="#4e65ff"
            shadow="0 0 20px #4e65ff, 0 0 40px #4e65ff, 0 0 60px #4e65ff"
            showSpinner={false}
            showForHashAnchor={false}
          />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
