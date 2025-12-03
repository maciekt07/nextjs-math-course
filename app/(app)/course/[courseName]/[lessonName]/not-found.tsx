import { BookX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="mx-auto mb-4 w-24 h-24 flex items-center justify-center bg-primary/10 rounded-full">
          <BookX size={48} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Lesson Not Found</h1>
        <p className="text-muted-foreground">
          The lesson you are looking for does not exist.
        </p>
      </div>
    </div>
  );
}
