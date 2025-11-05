import { and, eq } from "drizzle-orm";
import { BookOpen, Calculator, Check, GraduationCap } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import BuyCourseButton from "@/components/buy-course-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { enrollment } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload-client";
import type { Media } from "@/payload-types";

const getCourses = async () => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "courses",
    limit: 10,
  });

  const coursesWithLessons = await Promise.all(
    (docs || []).map(async (course) => {
      const { totalDocs: lessonCount } = await payload.find({
        collection: "lessons",
        where: {
          course: { equals: course.id },
        },
        limit: 0,
      });
      return { ...course, lessonCount };
    }),
  );

  return coursesWithLessons;
};

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const courses = await getCourses();
  let ownedCourseIds = new Set<string>();
  if (session) {
    const rows = await db
      .select()
      .from(enrollment)
      .where(
        and(
          eq(enrollment.userId, session.user.id),
          eq(enrollment.status, "completed"),
        ),
      );
    ownedCourseIds = new Set(rows.map((r: { courseId: string }) => r.courseId));
  }
  return (
    <div className="w-full flex flex-col">
      <div className="pt-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center gap-6">
        <Calculator size={80} color="var(--primary)" />
        <h1 className="text-4xl md:text-5xl font-extrabold">
          Welcome {session?.user ? session.user.name : "to Math Course Online"}
        </h1>
        <p className="text-lg max-w-xl">
          Learn math interactively with our easy-to-follow lessons and
          exercises.
        </p>

        <div className="mt-8 flex flex-col gap-6 w-full max-w-5xl">
          {courses.map((course) => (
            <Card key={course.id} className="w-full">
              <CardHeader>
                <div className="flex items-start gap-4">
                  {course.media ? (
                    <div className="w-32 h-32 rounded-lg overflow-hidden shrink-0 shadow-md">
                      <Image
                        src={(course.media as Media).url!}
                        alt={(course.media as Media).alt ?? course.title}
                        width={100}
                        height={100}
                        className="object-cover w-full h-full"
                        placeholder={
                          (course.media as Media).blurhash ? "blur" : "empty"
                        }
                        blurDataURL={
                          (course.media as Media).blurhash || undefined
                        }
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 shrink-0 flex items-center justify-center">
                      <GraduationCap className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl md:text-2xl text-left">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="mt-1 text-left">
                      {course.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen size={20} /> {course.lessonCount} Chapters
                  </div>
                  {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock size={20} /> 16 Hours
                  </div> */}
                </div>
                {ownedCourseIds.has(course.id) ? (
                  <Button size="lg" asChild>
                    <Link href={`/course/${course.slug}`}>See All Lessons</Link>
                  </Button>
                ) : (
                  <Button variant="green" size="lg" asChild>
                    <Link href={`/course/${course.slug}`}>
                      See Free Lessons
                    </Link>
                  </Button>
                )}
              </CardContent>
              <CardFooter className="border-t dark:border-border">
                {ownedCourseIds.has(course.id) ? (
                  <div className="flex items-center justify-center w-full gap-2">
                    <Check size={28} className="text-green-600 " />
                    Owned
                  </div>
                ) : (
                  <div className="flex justify-between w-full items-center">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        Price
                      </span>
                      <span className="text-2xl font-bold">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(course.price ?? 0)}
                      </span>
                    </div>

                    <BuyCourseButton
                      courseId={course.id}
                      size="lg"
                      className="font-bold"
                    >
                      Buy Now
                    </BuyCourseButton>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
