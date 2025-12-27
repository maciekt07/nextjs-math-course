import { BookX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-68px)] items-center justify-center overflow-hidden">
      <EmptyState
        icon={BookX}
        title="Lesson Not Found"
        description="The lesson you are looking for does not exist."
      />
    </div>
  );
}
