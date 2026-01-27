import { headers } from "next/headers";
import type { ReactNode } from "react";
import Footer from "@/components/footer";
import { auth } from "@/lib/auth/auth";
import { Navbar } from "./_components/navbar";

export default async function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex flex-col min-h-screen viewport-smooth-scroll">
      <Navbar user={session?.user || null} />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
