import HeroSvgComponent from "@/components/hero-svg/hero-svg";
import { cn } from "@/lib/utils";

interface HeroImageProps {
  className?: string;
}

export function HeroImage({ className }: HeroImageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full gap-2",
        className,
      )}
    >
      <div className="relative w-full h-full">
        <HeroSvgComponent className="absolute top-0 left-0 w-full h-full object-contain" />
      </div>
      {/* <motion.a
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "none" }}
        transition={{ duration: 0.6, delay: 4.5 }} */}
      <a
        href="https://storyset.com/people"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        People illustrations by Storyset
      </a>
    </div>
  );
}
