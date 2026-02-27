import { headers } from "next/headers";
import { Navbar } from "@/app/(app)/(landing)/_components/navbar";
import Footer from "@/components/footer";
import { auth } from "@/lib/auth/auth";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
      <div className="flex viewport-smooth-scroll">
        <Navbar user={session?.user || null} />
      </div>
      <main>
        <div className="min-h-[calc(100dvh-128px)] flex items-start md:items-center justify-center">
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
