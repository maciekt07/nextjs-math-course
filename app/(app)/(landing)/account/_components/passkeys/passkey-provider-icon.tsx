"use client";

import { KeyRound } from "lucide-react";
import { useState } from "react";

interface PasskeyProviderIconProps {
  icon?: string;
  providerName?: string;
}

export function PasskeyProviderIcon({
  icon,
  providerName,
}: PasskeyProviderIconProps) {
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  if (!icon || imageFailed) {
    return <KeyRound className="size-6 shrink-0 text-muted-foreground" />;
  }

  return (
    // biome-ignore lint/performance/noImgElement: data url
    <img
      src={icon}
      alt={providerName ? `${providerName} passkey` : "Passkey provider"}
      className="size-10 object-contain"
      onError={() => setImageFailed(true)}
    />
  );
}
