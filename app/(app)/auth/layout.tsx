import type { Metadata } from "next";
import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { getServerSession } from "@/lib/auth/get-session";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  description: "Securely sign in, sign up, and manage account access.",
});

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  return (
    <>
      <div className="flex viewport-smooth-scroll">
        <Navbar user={session?.user || null} />
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
