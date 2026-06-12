import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";

export async function getIsDraftMode() {
  try {
    const draft = await draftMode();
    return draft.isEnabled;
  } catch {
    return false;
  }
}

export function withCache<TArgs extends unknown[], TResult>(
  cb: (...args: TArgs) => Promise<TResult>,
  keyParts?: string[],
  options?: {
    revalidate?: number | false;
    tags?: string[];
  },
) {
  return async (...args: TArgs): Promise<TResult> => {
    const isDraftMode = await getIsDraftMode();

    if (isDraftMode) {
      return cb(...args);
    }

    const cachedFn = unstable_cache(cb, keyParts, options);
    return cachedFn(...args);
  };
}
