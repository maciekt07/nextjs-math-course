import { BookOpen, Calculator, GraduationCap } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload-client";

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
            <Card key={course.id} className="shadow-lg w-full">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 shrink-0">
                    <GraduationCap className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  </div>
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
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white"
                  size="lg"
                  asChild
                >
                  <Link href={`/course/${course.slug}`}>See Free Lessons</Link>
                </Button>
              </CardContent>

              <CardFooter className="flex justify-between items-center pt-6 border-t dark:border-border">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Price
                  </span>
                  <span className="text-2xl font-bold">$49</span>
                </div>
                <Button size="lg" className="font-bold">
                  Buy Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
