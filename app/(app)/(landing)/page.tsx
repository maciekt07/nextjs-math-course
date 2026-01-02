import { and, count, eq } from "drizzle-orm";
import { BookOpen } from "lucide-react";
import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { enrollment, user } from "@/drizzle/schema";
import { auth } from "@/lib/auth/auth";
import { getPayloadClient } from "@/lib/payload-client";
import { CTASection } from "./_components/cta";
import { FAQ } from "./_components/faq";
import { HeroBadge } from "./_components/hero-badge";
import { HeroImage } from "./_components/hero-image";
import { WhyChoose } from "./_components/why-choose";

const getCourses = unstable_cache(
  async () => {
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
  },
  ["courses-list"],
  { revalidate: 3600, tags: ["courses-list"] },
);

const getUserCount = unstable_cache(
  async () => {
    const result = await db.select({ count: count() }).from(user);
    return result[0]?.count || 0;
  },
  ["user-count"],
  { revalidate: 3600 },
);

const getOwnedCourseIds = (userId: string) =>
  unstable_cache(
    async () => {
      const rows = await db
        .select({ courseId: enrollment.courseId })
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
  );

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  const courses = await getCourses();
  const userCount = getUserCount();

  let ownedCourseIds: string[] = [];

  if (session?.user?.id) {
    const getOwnedCoursesFunc = getOwnedCourseIds(session.user.id);
    ownedCourseIds = await getOwnedCoursesFunc();
  }

  const formattedUserCount = Math.max(
    10,
    Math.floor((await userCount) / 10) * 10,
  );

  return (
    <div className="w-full flex flex-col">
      <section className="mt-0 sm:mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="flex flex-col gap-3 sm:gap-6 text-left order-1 lg:order-1">
              <HeroBadge />
              <h1 className="text-3xl sm:text-5xl font-bold text-foreground leading-tight text-balance">
                Master <span className="text-primary">Mathematics</span> with
                Engaging Courses
              </h1>
              <p className="text-md sm:text-lg text-muted-foreground max-w-xl">
                Learn from a <b>dedicated math educator</b> with interactive
                lessons, exercises, and real-life examples. Perfect for all
                learning styles.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="xl" asChild>
                  <a href="#courses">Explore Courses</a>
                </Button>
                {courses.length > 0 && (
                  <Button variant="outline" size="xl" asChild>
                    <Link
                      href={
                        courses[0].slug ? `/course/${courses[0].slug}` : "#"
                      }
                    >
                      <BookOpen /> Watch Free Demo
                    </Link>
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {formattedUserCount}+
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Students Learning
                  </p>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {courses.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Courses</p>
                </div>
              </div>
            </div>
            <HeroImage className="h-96 -my-8 rounded-2xl sm:h-128 lg:h-[600px] max-w-md lg:max-w-none mx-auto order-3 lg:order-2" />
          </div>
        </div>
      </section>
      {courses.length > 0 ? (
        <>
          <div className="mt-16 px-4 sm:px-6 max-w-7xl mx-auto text-center">
            <h2
              className="text-3xl sm:text-4xl font-bold text-foreground scroll-mt-24"
              id="courses"
            >
              Courses
            </h2>
            <p className="mt-2 text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our carefully designed math courses and interactive
              lessons to help you master concepts efficiently and confidently.
            </p>
          </div>

          <div className="mt-8 px-4 sm:px-6 max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  owned={ownedCourseIds.includes(course.id)}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-16 px-4 sm:px-6 max-w-7xl mx-auto text-center text-muted-foreground">
          <h2 className="text-2xl sm:text-3xl font-semibold">
            No Courses Available
          </h2>
          <p className="mt-2 text-md sm:text-lg">
            No courses are available at the moment. Please check back later!
          </p>
        </div>
      )}

      <WhyChoose />
      <FAQ />
      <CTASection
        userCount={formattedUserCount}
        courseCount={courses.length}
        previewLink={
          courses.length > 0 ? `/course/${courses[0].slug}` : undefined
        }
      />
    </div>
  );
}
