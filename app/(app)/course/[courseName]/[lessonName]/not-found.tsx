export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Lesson Not Found</h1>
        <p className="text-muted-foreground">
          The lesson you are looking for does not exist.
        </p>
      </div>
    </div>
  );
}
