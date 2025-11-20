import { Inter } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const openDyslexic = localFont({
  variable: "--font-dyslexic",
  display: "swap",
  src: [
    {
      path: "../public/fonts/OpenDyslexic/OpenDyslexic-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/OpenDyslexic/OpenDyslexic-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/OpenDyslexic/OpenDyslexic-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
});
