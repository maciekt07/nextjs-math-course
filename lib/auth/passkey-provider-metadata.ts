import "server-only";

import aaguidMetadata from "./data/aaguid.json";

// https://fidoalliance.org/metadata/

interface AAGUIDMetadata {
  name?: string;
  icon_light?: string;
  icon_dark?: string;
}

const metadata = aaguidMetadata as Record<string, AAGUIDMetadata>;

export function getPasskeyProviderMetadata(aaguid?: string | null) {
  if (!aaguid) return undefined;

  const provider = metadata[aaguid.toLowerCase()];
  if (!provider) return undefined;

  return {
    name: provider.name,
    icon: provider.icon_light ?? provider.icon_dark,
  };
}
