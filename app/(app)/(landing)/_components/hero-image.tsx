import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface HeroImageProps {
  className?: string;
  imageProps?: Omit<ImageProps, "src" | "alt" | "fill">;
}

export function HeroImage({ className, imageProps }: HeroImageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full gap-2",
        className,
      )}
    >
      <div className="relative w-full h-full">
        <Image
          src="/hero-illustration.svg"
          alt="Hero"
          fill
          className="object-contain"
          unoptimized
          {...imageProps}
        />
      </div>
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
