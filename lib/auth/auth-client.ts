import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";

export const authClient = createAuthClient({
  fetchOptions: {
    onError: ({ response, error }) => {
      // rate limit
      if (response?.status === 429) {
        const retryAfter = response.headers.get("X-Retry-After");
        toast.error(
          `Rate limit exceeded. Retry after ${retryAfter ?? "a few"} seconds`,
        );
        return;
      }
      toast.error(error?.message ?? "Something went wrong");
    },
  },
});

export type Session = typeof authClient.$Infer.Session.user;
