import type { Metadata } from "next";
import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  description: "Securely sign in, sign up, and manage account access.",
});

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex viewport-smooth-scroll">
        <Navbar />
      </div>
      <main className="px-4">
        <div className="min-h-[calc(100dvh-100px)] flex items-start md:items-center justify-center">
          <div className="w-full max-w-md flex flex-col items-center">
            {children}
          </div>
        </div>
        <div className="mt-4">
          <Footer />
        </div>
      </main>
    </>
  );
}
