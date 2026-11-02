"use client";

import { EyeIcon } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { EyeOffIcon } from "@/components/animate-ui/icons/eye-off";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/ui";

export function PasswordInput({
  className,
  ...props
}: Omit<ComponentProps<typeof Input>, "type">) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? "text" : "password"}
        className={cn("pr-10", className)}
      />
      <Button
        variant="ghost"
        size="icon"
        type="button"
        className="absolute right-1.5 top-1/2 size-7 -translate-y-1/2 cursor-pointer"
        onClick={() => setShowPassword((p) => !p)}
      >
        <span className="relative flex items-center justify-center size-5">
          <EyeIcon
            className={cn(
              "absolute inset-0 size-5 transition-all duration-200 ease-out",
              showPassword ? "opacity-0 scale-75" : "opacity-100 scale-100",
            )}
          />

          <EyeOffIcon
            animate={showPassword}
            className={cn(
              "absolute inset-0 size-5 transition-all duration-200 ease-out",
              showPassword ? "opacity-100 scale-100" : "opacity-0 scale-75",
            )}
          />
        </span>
        <span className="sr-only">
          {showPassword ? "Hide password" : "Show password"}
        </span>
      </Button>
    </div>
  );
}
