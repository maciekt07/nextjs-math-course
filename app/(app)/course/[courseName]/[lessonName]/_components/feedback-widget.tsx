"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Frown, Meh, Send, Smile, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Textarea } from "@/components/ui/textarea";
import { FEEDBACK_LIMITS } from "@/lib/constants/limits";
import type { Lesson } from "@/payload-types";

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
  const [selectedReaction, setSelectedReaction] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleReaction = (value: number) => {
    setSelectedReaction((prev) => (prev === value ? null : value));
  };

  const handleSubmit = async () => {
    if (!selectedReaction) return;

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

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit feedback");
      }

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setSelectedReaction(null);
        setComment("");
      }, 3000);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to submit feedback. ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto mb-8">
      <div className="flex flex-col items-center rounded-xl border p-4 shadow-sm bg-background">
        <h3 className="text-md font-medium text-foreground mb-3">
          How was this {type === "quiz" || type === "video" ? type : "lesson"}?
        </h3>

        {/* reaction Buttons */}
        <div className="flex gap-2 flex-wrap justify-center">
          {reactions.map((reaction) => {
            const Icon = reaction.icon;
            const selected = selectedReaction === reaction.value;
            return (
              <motion.button
                key={reaction.value}
                onClick={() => toggleReaction(reaction.value)}
                disabled={isSubmitted}
                className={`flex items-center gap-1 px-2 py-1 rounded-full border text-sm transition-colors cursor-pointer
                  ${
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-foreground border-border hover:bg-secondary/80"
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon strokeWidth={2.5} className="w-4 h-4" />
                <span>{reaction.label}</span>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          className="w-full overflow-hidden"
          initial={false}
          animate={{
            height:
              selectedReaction && !isSubmitted
                ? "auto"
                : isSubmitted
                  ? "auto"
                  : 0,
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
