import type { GenericEndpointContext, User } from "better-auth";

type UserLikeProfile = {
  name?: string | null;
  image?: string | null;
};

function getFirstWord(value?: string | null) {
  const normalized = value?.trim();
  if (!normalized) return undefined;
  return normalized.split(/\s+/)[0];
}

function normalizeGoogleUser<T extends UserLikeProfile>(user: T) {
  return {
    ...user,
    name: getFirstWord(user.name) ?? user.name,
    image: undefined,
  };
}

export const GOOGLE_ONE_TAP_PATH = "/one-tap/callback";

export const handleGoogleOneTapUser = async (
  user: Partial<User>,
  context: GenericEndpointContext | null,
) => {
  if (context?.path !== GOOGLE_ONE_TAP_PATH) return;

  return {
    data: normalizeGoogleUser(user),
  };
};
