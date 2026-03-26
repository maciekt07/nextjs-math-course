import {
  lastLoginMethodClient,
  oneTapClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";
import { clientEnv } from "@/env/client";
import { formatSeconds } from "@/lib/format";

export const authClient = createAuthClient({
  plugins: [
    lastLoginMethodClient(),
    oneTapClient({
      clientId: clientEnv.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      cancelOnTapOutside: false,
      autoSelect: false,
      context: "use",
      uxMode: "popup",
      promptOptions: {
        baseDelay: 3000,
        maxAttempts: 2,
      },
      // https://developers.google.com/identity/gsi/web/reference/js-reference
      additionalOptions: {
        use_fedcm_for_prompt: true,
      },
    }),
  ],
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

// export type Session = typeof authClient.$Infer.Session.user;
