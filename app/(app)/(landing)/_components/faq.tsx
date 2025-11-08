import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs: { question: string; answer: string }[] = [
  {
    question: "How do I access my purchased courses?",
    answer:
      'Once you purchase a course, it will be immediately available in your account. Simply log in and navigate to "My Courses" to access all your purchased content. You\'ll have lifetime access to the materials.',
  },
  {
    question: "Are there any prerequisites for the courses?",
    answer:
      "Most courses are beginner-friendly. However, check the course description for any specific prerequisites or recommended skill levels.",
  },
  {
    question: "Can I access free lessons before purchasing?",
    answer:
      'Yes! Every course includes free preview lessons so you can experience the teaching style and content quality before buying. Click "See Free Lessons" on any course card.',
  },
  {
    question: "Can I access courses on mobile devices?",
    answer:
      "Completely! The platform is fully responsive and works seamlessly on phones, tablets, and computers. Learn on your schedule, wherever you are.",
  },
];

export function FAQ() {
  return (
    <section
      className="mt-16 mb-8 px-4 sm:px-6 max-w-4xl mx-auto w-full"
      id="faq"
    >
      <div className="mb-8 text-left">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-lg text-muted-foreground">
          Everything you need to know about courses
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-3 w-full">
        {faqs.map((faq, i) => (
          <AccordionItem
            // biome-ignore lint/suspicious/noArrayIndexKey: safe here
            key={i}
            value={`item-${i}`}
            className="border border-border rounded-xl bg-muted/40 px-4"
          >
            <AccordionTrigger className="text-left py-4 hover:no-underline [&>svg]:text-muted-foreground">
              <span className="font-medium">{faq.question}</span>
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
