"use client";

import Bowser from "bowser";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Frown, Meh, Send, Smile, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Textarea } from "@/components/ui/textarea";
import { useMounted } from "@/hooks/use-mounted";
import { authClient } from "@/lib/auth/auth-client";
import { FEEDBACK_LIMITS } from "@/lib/constants/limits";
import { cn } from "@/lib/ui";
import type { Lesson } from "@/types/payload-types";

const reactions = [
  { value: 1, icon: Frown, label: "Poor" },
  { value: 2, icon: Meh, label: "Fair" },
  { value: 3, icon: Smile, label: "Good" },
  { value: 4, icon: Star, label: "Excellent" },
];

export default function FeedbackWidget({
  lessonId,
  type,
}: {
  lessonId: string;
  type: Lesson["type"];
}) {
  const { data: session, isPending } = authClient.useSession();
  const [selectedReaction, setSelectedReaction] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const isMounted = useMounted();
  const commentRef = useRef(comment);

  function isFirefox() {
    if (typeof window === "undefined") return false;
    return Bowser.getParser(window.navigator.userAgent).is("firefox");
  }

  const toggleReaction = (value: number) => {
    setSelectedReaction((prev) => (prev === value ? null : value));
  };

  const handleSubmit = async () => {
    if (!selectedReaction) return;

    setIsSubmitting(true);

    const response = await fetch("/api/send-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId,
        reaction: selectedReaction,
        comment: comment.trim(),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      toast.error(
        `Failed to submit feedback: ${data.error || "Unknown error"}`,
      );
      setIsSubmitting(false);
      return;
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setSelectedReaction(null);
      setComment("");
    }, 3000);

    setIsSubmitting(false);
  };

  useEffect(() => {
    commentRef.current = comment;
  }, [comment]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (commentRef.current.trim() !== "") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload, {
      passive: true,
    });
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // if (isPending) {
  //   return (
  //     <div className="w-full max-w-sm mx-auto my-8 font-inter">
  //       <div className="flex flex-col items-center rounded-xl border p-4 bg-background">
  //         <Skeleton className="h-5 w-3/4 mb-3 rounded" />
  //         <div className="flex gap-2 flex-wrap justify-center">
  //           {Array(4)
  //             .fill(0)
  //             .map((_, i) => (
  //               <Skeleton
  //                 // biome-ignore lint/suspicious/noArrayIndexKey: safe
  //                 key={i}
  //                 className="h-7 w-20 rounded-full"
  //               />
  //             ))}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  if (!session || !isMounted || isPending) {
    return null;
  }

  return (
    <div className="w-full sm:max-w-sm mx-auto my-10 font-inter">
      <div className="flex flex-col items-center rounded-xl border p-4 bg-background">
        <p className="text-md font-medium text-foreground mb-3 not-sr-only">
          How was this {type === "quiz" || type === "video" ? type : "lesson"}?
        </p>
        {/* reaction Buttons */}
        <div className="flex flex-col items-center gap-2 sm:gap-0">
          <div className="flex justify-center gap-6 sm:gap-1.5 flex-wrap">
            {reactions.map((reaction) => {
              const Icon = reaction.icon;
              const selected = selectedReaction === reaction.value;
              //  text-transparent! animate-pulse opacity-80
              return (
                <motion.button
                  type="button"
                  aria-label={reaction.label}
                  aria-pressed={selected}
                  title={reaction.label}
                  key={reaction.value}
                  onClick={() => toggleReaction(reaction.value)}
                  disabled={isSubmitted || !isMounted}
                  className={cn(
                    "flex items-center justify-center whitespace-nowrap border transition-colors cursor-pointer",
                    "h-10 w-10 sm:h-auto sm:w-auto px-0 sm:px-2 py-0 sm:py-1",
                    "rounded-md sm:rounded-full",
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-foreground border-border hover:bg-secondary/80",
                  )}
                  whileHover={!isFirefox() ? { scale: 1.05 } : undefined}
                  whileTap={!isFirefox() ? { scale: 0.95 } : undefined}
                >
                  <Icon
                    strokeWidth={2.4}
                    className="h-6 w-6 sm:h-[18px] sm:w-[18px]"
                  />
                  <span className="hidden sm:inline ml-1 text-sm">
                    {reaction.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* mobile labels */}
          <div className="flex w-full justify-between px-1 sm:hidden">
            <span className="text-xs text-muted-foreground">
              {reactions[0]?.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {reactions[reactions.length - 1]?.label}
            </span>
          </div>
        </div>

        <motion.div
          className="w-full overflow-hidden"
          initial={false}
          animate={{
            height: selectedReaction || isSubmitted ? "auto" : 0,
            marginTop: selectedReaction || isSubmitted ? 12 : 0,
          }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <AnimatePresence mode="wait">
            {/* feedback form */}
            {selectedReaction && !isSubmitted && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <Textarea
                  placeholder="Add a comment (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[80px] resize-none mt-2 focus-visible:ring-0 transition-colors"
                  disabled={isSubmitting}
                />
                <p
                  className={`text-xs mt-1 text-right ${
                    comment.length > FEEDBACK_LIMITS.comment
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {comment.length}/{FEEDBACK_LIMITS.comment}
                </p>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    !selectedReaction ||
                    comment.length > FEEDBACK_LIMITS.comment
                  }
                  className="w-full mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LoadingSwap
                    isLoading={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Feedback
                  </LoadingSwap>
                </Button>
              </motion.div>
            )}

            {/* success message */}
            {isSubmitted && selectedReaction && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center gap-3 py-4 w-full"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                    delay: 0.1,
                  }}
                  className="bg-green-600/10 p-4 rounded-full flex items-center justify-center mx-auto"
                >
                  <Check size={32} strokeWidth={3} className="text-green-600" />
                </motion.div>
                <div className="text-center">
                  <p className="font-medium text-foreground">
                    Thank you for your feedback!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your response has been received.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
