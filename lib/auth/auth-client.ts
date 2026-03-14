import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";
import { formatSeconds } from "@/lib/format";

export const authClient = createAuthClient({
  fetchOptions: {
    onError: ({ response, error }) => {
      // rate limit
      if (response?.status === 429) {
        const retryAfter = response.headers.get("X-Retry-After");
        const formattedRetryAfter = retryAfter
          ? formatSeconds(Number(retryAfter))
          : null;
        toast.error(
          `Rate limit exceeded. Retry after ${formattedRetryAfter ?? "a few seconds"}.`,
        );
        return;
      }
      toast.error(error?.message ?? "Something went wrong");
    },
  },
});

export type Session = typeof authClient.$Infer.Session.user;
