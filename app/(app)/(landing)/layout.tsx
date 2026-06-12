import type { ReactNode } from "react";
import Footer from "@/components/footer/footer";
import { Navbar } from "@/components/navbar";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen viewport-smooth-scroll">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
