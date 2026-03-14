import type React from "react";

interface AuthContainerProps {
  children: React.ReactNode;
}

export function AuthContainer({ children }: AuthContainerProps) {
  return <div className="flex flex-col items-center gap-8">{children}</div>;
}
