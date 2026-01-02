import { BookX } from "lucide-react";
import { EmptyState, EmptyStateCenterWrapper } from "@/components/empty-state";

export default function NotFound() {
  return (
    <EmptyStateCenterWrapper>
      <EmptyState
        icon={BookX}
        title="Lesson Not Found"
        description="The lesson you are looking for does not exist."
      />
    </EmptyStateCenterWrapper>
  );
}
