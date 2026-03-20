import type { GenericEndpointContext, User } from "better-auth";

type GoogleLikeProfile = {
  given_name?: string | null;
  name?: string | null;
};

type UserLikeProfile = {
  name?: string | null;
  image?: string | null;
};

function getFirstWord(value?: string | null) {
  const normalized = value?.trim();
  if (!normalized) return undefined;
  return normalized.split(/\s+/)[0];
}

export function getGoogleFirstName(profile: GoogleLikeProfile) {
  return getFirstWord(profile.given_name) ?? getFirstWord(profile.name);
}

export function normalizeGoogleUser<T extends UserLikeProfile>(user: T) {
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
