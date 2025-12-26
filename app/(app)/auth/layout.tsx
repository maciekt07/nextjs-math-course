import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/footer";
import { ThemeSelect } from "@/components/theme-select";
import { Button } from "@/components/ui/button";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="px-4">
      <div className="absolute top-4 left-4">
        <Button asChild variant="ghost" className="gap-1 px-2 h-9">
          <Link href="/">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to home</span>
          </Link>
        </Button>
      </div>
      <div className="absolute top-4 right-4">
        <ThemeSelect />
      </div>
      <div className="min-h-screen flex items-start md:items-center justify-center">
        <div className="w-full max-w-md flex flex-col items-center mt-24 md:mt-0">
          {children}
        </div>
      </div>
      <div className="mt-4">
        <Footer />
      </div>
    </main>
  );
}
