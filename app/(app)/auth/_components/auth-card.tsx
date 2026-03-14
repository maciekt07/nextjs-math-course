import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/ui";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className="w-full flex-shrink-0 gap-5">
      <CardHeader className="space-y-1">
        <div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="mt-2">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="auth-form">{children}</CardContent>
    </Card>
  );
}

const iconWrapperVariants = cva(
  "p-6 rounded-full mx-auto flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        destructive: "bg-destructive/10 text-destructive",
        success:
          "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface AuthIconCardProps extends React.ComponentProps<"div"> {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  variant?: VariantProps<typeof iconWrapperVariants>["variant"];
}

export function AuthIconCard({
  icon: Icon,
  title,
  description,
  children,
  variant = "default",
  className,
}: AuthIconCardProps) {
  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="space-y-3 text-center">
        {Icon && (
          <div className={cn(iconWrapperVariants({ variant }))}>
            <Icon className="h-12 w-12" />
          </div>
        )}
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      {children && (
        <CardContent className="pt-0 flex flex-col items-center space-y-4 w-full">
          {children}
        </CardContent>
      )}
    </Card>
  );
}
