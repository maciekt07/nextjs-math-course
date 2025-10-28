import { and, eq } from "drizzle-orm";
import { BookOpen } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload-client";

export default async function CoursesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in?returnTo=/courses");
  }

  const rows = await db
    .select()
    .from(enrollment)
    .where(
      and(
        eq(enrollment.userId, session.user.id),
        eq(enrollment.status, "completed"),
      ),
    );

  const courseIds = rows.map((r: { courseId: string }) => r.courseId);

  if (courseIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-4">
        <div className="p-6 rounded-full bg-gray-200 dark:bg-gray-800">
          <BookOpen size={48} className="text-gray-600 dark:text-gray-300" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          No courses yet
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Browse available courses and buy one to see it in this list.
        </p>
        <Button asChild size="lg">
          <Link href="/">Browse Courses</Link>
        </Button>
      </div>
    );
  }

  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "courses",
    where: { id: { in: courseIds } },
    limit: 100,
    select: { title: true, description: true, slug: true, id: true },
  });
  const courses = res.docs || [];

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Your Courses</h1>
      {courses.map((c) => (
        <Card
          key={c.id}
          className="p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
        >
          <div className="flex-1">
            <CardTitle className="text-xl md:text-2xl">{c.title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {c.description}
            </CardDescription>
          </div>

          <div className="flex-shrink-0">
            <Button asChild size="lg" className="w-full">
              <Link href={`/course/${c.slug}`}>Open</Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
