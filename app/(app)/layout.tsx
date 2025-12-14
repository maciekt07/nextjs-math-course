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
};

export const viewport: Viewport = {
  themeColor: {
    color: "#4e65ff",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-main antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
