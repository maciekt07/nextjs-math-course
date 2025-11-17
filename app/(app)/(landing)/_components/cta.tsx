import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  userCount: number;
  courseCount: number;
  previewLink: string;
}

export function CTASection({
  userCount,
  courseCount,
  previewLink,
}: CTASectionProps) {
  const features = [
    {
      title: `${userCount}+ Students`,
      description: "Learning with us",
    },
    {
      title: `${courseCount} Courses`,
      description: "Built with precision",
    },
    {
      title: "Free Previews",
      description: "Try before joining",
    },
  ];

  return (
    <section className="py-10 sm:py-16 bg-primary/90 text-primary-foreground border-t mt-8 sm:m-8 sm:rounded-3xl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            Ready to Master Mathematics?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto text-pretty">
            Join many students who have transformed their relationship with
            math. Start your learning journey today with a free preview of any
            course.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              asChild
              className="bg-white text-gray-900 hover:bg-white/90 px-8 py-6 text-base inline-flex items-center justify-center gap-2"
            >
              <Link href={previewLink}>
                Start Free Preview
                <ArrowRight size={20} />
              </Link>
            </Button>
            <Button
              size="lg"
              asChild
              className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white hover:border-white/50 px-8 py-6 text-base"
            >
              <a href="#courses">View All Courses</a>
            </Button>
          </div>

          <div className="pt-8 border-t border-white/20 overflow-x-auto">
            <div className="flex justify-center sm:grid sm:grid-cols-3 gap-4 sm:gap-6 min-w-max sm:min-w-0">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-center gap-2 sm:gap-3 text-left flex-shrink-0"
                >
                  <CheckCircle2
                    size={18}
                    className="text-white opacity-90 shrink-0"
                  />
                  <div className="leading-tight">
                    <p className="font-medium text-sm sm:text-base text-white">
                      {feature.title}
                    </p>
                    <p className="text-xs sm:text-sm text-white/80">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
