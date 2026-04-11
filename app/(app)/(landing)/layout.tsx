import type { ReactNode } from "react";
import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { getServerSession } from "@/lib/auth/get-session";

export default async function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession();
  return (
    <div className="flex flex-col min-h-screen viewport-smooth-scroll">
      <Navbar user={session?.user || null} />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
