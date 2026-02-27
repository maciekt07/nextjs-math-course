import { BookOpen } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { Compass } from "@/components/animate-ui/icons/compass";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/auth";
import { getCourses, getOwnedCourseIds } from "@/lib/data/courses";
import { getUserCount } from "@/lib/data/users";
import { CTASection } from "./_components/cta";
import { FAQ } from "./_components/faq";
import { GridBackground } from "./_components/grid-background";
import { HeroBadge } from "./_components/hero-badge";
import { HeroImage } from "./_components/hero-image";
import { WhyChoose } from "./_components/why-choose";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  const [courses, userCount, ownedIds] = await Promise.all([
    getCourses(),
    getUserCount(),
    session?.user?.id ? getOwnedCourseIds(session.user.id) : [],
  ]);

  const ownedSet = new Set(ownedIds);

  const formattedUserCount = Math.max(10, Math.floor(userCount / 10) * 10);

  return (
    <div className="w-full flex flex-col ">
      <GridBackground />
      <section className="mt-0 sm:mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="flex flex-col gap-4 sm:gap-6 text-left order-1 lg:order-1">
              <div className="flex items-center justify-center md:justify-start">
                <HeroBadge />
              </div>
              <h1 className="text-3xl sm:text-5xl text-center md:text-left font-bold text-foreground leading-tight text-balance text-shadow-md">
                Master{" "}
                <span className="text-primary text-shadow-lg">Mathematics</span>{" "}
                with Engaging Courses
              </h1>
              <p className="text-md sm:text-lg text-center md:text-left text-muted-foreground max-w-xl">
                Learn from a{" "}
                <b className="text-foreground/80 text-shadow-md">
                  dedicated math educator
                </b>{" "}
                with interactive lessons, exercises, and real-life examples.
                Perfect for all learning styles.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <AnimateIcon animateOnHover>
                  <Button size="xl" asChild className="w-full">
                    <a href="#courses">
                      <Compass className="size-5" /> Explore Courses
                    </a>
                  </Button>
                </AnimateIcon>
                {courses.length > 0 && (
                  <Button
                    variant="outline"
                    size="xl"
                    asChild
                    className="backdrop-blur-2xl"
                  >
                    <Link
                      href={
                        courses[0].slug ? `/course/${courses[0].slug}` : "#"
                      }
                    >
                      <BookOpen className="size-4" /> Watch Free Demo
                    </Link>
                  </Button>
                )}
              </div>
              <div className="flex h-16 items-center gap-8 pt-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {formattedUserCount}+
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Students Learning
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {courses.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Courses</p>
                </div>
              </div>
            </div>
            <HeroImage className="h-[450px] -my-8 rounded-2xl sm:h-128 lg:h-[600px] max-w-md lg:max-w-none mx-auto order-3 lg:order-2" />
          </div>
        </div>
      </section>
      {courses.length > 0 ? (
        <div className="mt-24 pb-16 bg-gradient-to-b from-background to-neutral-100 dark:to-neutral-900">
          <div className="px-4 sm:px-6 max-w-7xl mx-auto text-center">
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
                  owned={ownedSet.has(course.id)}
                />
              ))}
            </div>
          </div>
        </div>
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
