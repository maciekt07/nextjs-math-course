import { Button } from "@/components/ui/button";
import { Calculator, Play } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full flex flex-col">
      <div className="pt-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center gap-6">
        <Calculator size={80} color="var(--primary)" />
        <h1 className="text-4xl md:text-5xl font-extrabold">
          Welcome to Math Course Online
        </h1>
        <p className="text-lg max-w-xl">
          Learn math interactively with our easy-to-follow lessons and
          exercises.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <Button className="flex items-center gap-2" size="lg">
            <Play /> Get Started
          </Button>
          <Button variant="outline" size="lg">
            <Link href="/pricing">Pricing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
