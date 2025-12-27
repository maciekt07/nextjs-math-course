import { and, eq } from "drizzle-orm";
import { BookOpen, GraduationCap } from "lucide-react";
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { auth } from "@/lib/auth/auth";
import { getPayloadClient } from "@/lib/payload-client";
import type { Media } from "@/payload-types";

export const metadata = {
  title: "Your Courses",
};

function getUserEnrollments(userId: string) {
  return unstable_cache(
    async () => {
      const rows = await db
        .select()
        .from(enrollment)
        .where(
          and(
            eq(enrollment.userId, userId),
            eq(enrollment.status, "completed"),
          ),
        );

      return rows.map((r) => r.courseId);
    },
    ["enrollments", userId],
    { revalidate: 300, tags: [`enrollments:${userId}`] },
  )();
}

const getCoursesByIds = unstable_cache(
  async (ids: string[]) => {
    if (ids.length === 0) return [];
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "courses",
      where: { id: { in: ids } },
      limit: 100,
      select: {
        title: true,
        description: true,
        slug: true,
        id: true,
        media: true,
      },
    });
    return res.docs || [];
  },
  ["courses-by-ids"],
  { revalidate: 3600, tags: ["courses-list"] },
);

export default async function CoursesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in?returnTo=/courses");
  }

  const courseIds = await getUserEnrollments(session.user.id);

  if (courseIds.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No courses yet"
        description="Start learning by exploring available courses. Once you purchase one, it will appear here in your library."
        action={
          <Button asChild size="xl">
            <a href="/#courses">
              <BookOpen />
              Browse Courses
            </a>
          </Button>
        }
      />
    );
  }

  const courses = await getCoursesByIds(courseIds);

  return (
    <div className="max-w-4xl mx-auto pt-0 p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Your Courses</h1>
      {courses.map((c) => (
        <Card
          key={c.id}
          className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
        >
          {c.media ? (
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={(c.media as Media).url!}
                alt={(c.media as Media).alt ?? c.title}
                width={96}
                height={96}
                className="object-cover w-full h-full"
                placeholder={(c.media as Media).blurhash ? "blur" : "empty"}
                blurDataURL={(c.media as Media).blurhash || undefined}
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-lg border-3 border-primary/30 bg-primary/10 shrink-0 flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
          )}

          <div className="flex-1">
            <CardTitle className="text-xl sm:text-2xl">{c.title}</CardTitle>
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
