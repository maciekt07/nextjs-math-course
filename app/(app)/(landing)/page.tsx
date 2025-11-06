import { and, count, eq } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { enrollment, user } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload-client";
import { FAQ } from "./_components/faq";
import { HeroImage } from "./_components/hero-image";
import { WhyChoose } from "./_components/why-choose";

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

const getUserCount = async () => {
  const result = await db.select({ count: count() }).from(user);
  return result[0]?.count || 0;
};

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  const courses = await getCourses();
  const userCount = getUserCount();

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
      <section className="bg-background mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="flex flex-col gap-6 text-left">
              <Badge
                variant="secondary"
                className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[16px] w-fit"
                asChild
              >
                <a
                  href="https://github.com/maciekt07"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5"
                >
                  <Image
                    src="https://avatars.githubusercontent.com/u/85953204?v=4"
                    alt="maciekt07 GitHub avatar"
                    width={32}
                    height={32}
                    className="rounded-full border border-border shadow-sm"
                    unoptimized
                  />

                  <span className="text-muted-foreground">Made by</span>
                  <span className="font-semibold text-foreground">
                    maciekt07
                  </span>
                </a>
              </Badge>

              <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight text-balance">
                Master <span className="text-primary">Mathematics</span> with
                Engaging Courses
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl">
                Learn from a dedicated math educator with interactive lessons,
                exercises, and real-life examples. Perfect for all learning
                styles.
              </p>

              {/* hero image - shows there on small screens */}
              <HeroImage className="lg:hidden h-64 sm:h-80 max-w-md mx-auto" />

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="xl" asChild>
                  <a href="#courses">
                    Explore Courses
                    <ArrowRight />
                  </a>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link
                    href={courses[0].slug ? `/course/${courses[0].slug}` : "#"}
                  >
                    Watch Free Demo
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.max(10, Math.floor((await userCount) / 10) * 10)}+
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
            {/* hero image - shows on right side on large screens */}
            <HeroImage className="hidden lg:flex h-[600px]" />
          </div>
        </div>
      </section>

      <div className="mt-16 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <h2
          className="text-3xl sm:text-4xl font-bold text-foreground"
          id="courses"
        >
          Courses
        </h2>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our carefully designed math courses and interactive lessons to
          help you master concepts efficiently and confidently.
        </p>
      </div>
      <div className="mt-8 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              owned={ownedCourseIds.has(course.id)}
            />
          ))}
        </div>
      </div>
      <WhyChoose />
      <FAQ />
    </div>
  );
}
