import Footer from "@/components/footer";
import { ThemeSelect } from "@/components/theme-select";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <div className="absolute top-4 right-4">
        <ThemeSelect />
      </div>
      {children}
      <Footer />
    </main>
  );
}
