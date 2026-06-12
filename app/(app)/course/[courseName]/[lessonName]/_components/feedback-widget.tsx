"use client";

import { Check, Frown, type LucideIcon, Meh, Smile, Star } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { defaultPatterns } from "web-haptics";
import { useWebHaptics } from "web-haptics/react";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Lock } from "@/components/animate-ui/icons/lock";
import { LogIn } from "@/components/animate-ui/icons/log-in";
import { Send } from "@/components/animate-ui/icons/send";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Textarea } from "@/components/ui/textarea";
import { useMounted } from "@/hooks/use-mounted";
import { authClient } from "@/lib/auth/auth-client";
import { LIMITS } from "@/lib/constants/limits";
import { system } from "@/lib/system";
import { cn } from "@/lib/ui";
import type { Lesson } from "@/types/payload-types";

interface Reaction {
  value: number;
  icon: LucideIcon;
  label: string;
}

const reactions = [
  { value: 1, icon: Frown, label: "Poor" },
  { value: 2, icon: Meh, label: "Fair" },
  { value: 3, icon: Smile, label: "Good" },
  { value: 4, icon: Star, label: "Excellent" },
] as const satisfies readonly Reaction[];

export default function FeedbackWidget({
  lessonId,
  type,
}: {
  lessonId: string;
  type: Lesson["type"];
}) {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const { trigger } = useWebHaptics();

  const [selectedReaction, setSelectedReaction] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const isMounted = useMounted();
  const commentRef = useRef(comment);
  const prefersReducedMotion = useReducedMotion();

  const isAuthorized = Boolean(isMounted && session && !isPending);
  const lessonLabel = type === "quiz" || type === "video" ? type : "lesson";

  const hasInvalidComment = comment.length > LIMITS.feedback.commentMaxLength;

  const disableSendButton =
    isSubmitting || !selectedReaction || hasInvalidComment || !isAuthorized;

  const disableOptions = isSubmitting || isSubmitted || !isAuthorized;

  const toggleReaction = (value: number) => {
    if (!isAuthorized) return;

    setSelectedReaction((prev) => (prev === value ? null : value));
    trigger(defaultPatterns.light);
  };

  const handleSubmit = async () => {
    if (!selectedReaction || !isAuthorized || hasInvalidComment) return;

    setIsSubmitting(true);

    try {
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
        return;
      }

      setIsSubmitted(true);

      window.setTimeout(() => {
        setIsSubmitted(false);
        setSelectedReaction(null);
        setComment("");
      }, 3000);
    } catch {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    commentRef.current = comment;
  }, [comment]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isAuthorized || commentRef.current.trim() === "") return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isAuthorized]);

  return (
    <div className="mx-auto my-10 w-full font-inter print:hidden sm:max-w-sm">
      <div className="relative overflow-hidden rounded-2xl border bg-background p-4 shadow-sm">
        <div
          className={cn(
            "flex flex-col items-center transition duration-300",
            !isAuthorized && "pointer-events-none select-none",
          )}
          aria-hidden={!isAuthorized}
        >
          <p className="mb-3 text-md font-medium text-foreground">
            How was this {lessonLabel}?
          </p>

          <div className="flex flex-col items-center gap-2 sm:gap-0">
            <div className="flex flex-wrap justify-center gap-6 sm:gap-1.5">
              {reactions.map((reaction) => {
                const Icon = reaction.icon;
                const selected = selectedReaction === reaction.value;

                return (
                  <motion.button
                    key={reaction.value}
                    type="button"
                    aria-label={reaction.label}
                    aria-pressed={selected}
                    title={reaction.label}
                    onClick={() => toggleReaction(reaction.value)}
                    disabled={disableOptions}
                    className={cn(
                      "flex items-center justify-center whitespace-nowrap border transition-colors",
                      "h-10 w-10 px-0 py-0 sm:h-auto sm:w-auto sm:px-2 sm:py-1",
                      "rounded-md sm:rounded-full",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary text-foreground hover:bg-secondary/80",
                      disableOptions ? "cursor-default" : "cursor-pointer",
                    )}
                    whileHover={
                      !system.isFirefox() &&
                      !prefersReducedMotion &&
                      !disableOptions
                        ? { scale: 1.05 }
                        : undefined
                    }
                    whileTap={
                      !system.isFirefox() &&
                      !prefersReducedMotion &&
                      !disableOptions
                        ? { scale: 0.95 }
                        : undefined
                    }
                  >
                    <Icon
                      strokeWidth={2.4}
                      className="h-6 w-6 sm:h-[18px] sm:w-[18px]"
                    />
                    <span className="ml-1 hidden text-sm sm:inline">
                      {reaction.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

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
                    onChange={(event) => setComment(event.target.value)}
                    className="mt-2 min-h-[80px] resize-none transition-colors focus-visible:ring-0"
                    disabled={isSubmitting}
                  />

                  <p
                    className={cn(
                      "mt-1 text-right text-xs",
                      hasInvalidComment
                        ? "text-red-500"
                        : "text-muted-foreground",
                    )}
                  >
                    {comment.length}/{LIMITS.feedback.commentMaxLength}
                  </p>

                  <AnimateIcon animateOnHover={!disableSendButton}>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={disableSendButton}
                      className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2"
                    >
                      <LoadingSwap
                        isLoading={isSubmitting}
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Send Feedback
                      </LoadingSwap>
                    </Button>
                  </AnimateIcon>
                </motion.div>
              )}

              {isSubmitted && selectedReaction && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className="flex w-full flex-col items-center gap-3 py-4"
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
                    className="mx-auto flex items-center justify-center rounded-full bg-green-600/10 p-4"
                  >
                    <Check
                      size={32}
                      strokeWidth={3}
                      className="text-green-600"
                    />
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

        {isMounted && !isAuthorized && !isPending && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-background/50 dark:bg-background/60 p-6 sm:p-5 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{
              once: true,
              amount: 0.7,
            }}
            transition={{
              duration: 0.3,
              delay: 0.3,
              ease: "easeOut",
            }}
          >
            <motion.div
              className="flex h-full w-full items-center justify-between gap-3 rounded-lg border bg-background/80 dark:bg-background/90 px-4 py-3 shadow-sm"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{
                once: true,
                amount: 0.7,
              }}
              transition={{
                duration: 0.22,
                delay: 0.6,
                ease: "easeOut",
              }}
            >
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock size={20} animateOnView delay={650} /> Sign in to leave
                feedback
              </p>

              <AnimateIcon animateOnHover>
                <Button
                  asChild
                  type="button"
                  size="sm"
                  className="shrink-0 cursor-pointer"
                >
                  <Link
                    href={{
                      pathname: "/auth/sign-in",
                      query: { returnTo: pathname },
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <LogIn size={16} />
                    Sign in
                  </Link>
                </Button>
              </AnimateIcon>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
