import { KeyRound } from "lucide-react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { LIMITS } from "@/lib/constants/limits";
import { AddPasskeyButton } from "./add-passkey-button";
import { PasskeyRow } from "./passkey-row";

const CREATED_AT_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export async function Passkeys() {
  const passkeys =
    (await auth.api.listPasskeys({ headers: await headers() })) ?? [];
  const atLimit = passkeys.length >= LIMITS.auth.maxPasskeys;

  return (
    <div className="flex flex-col gap-4">
      {passkeys.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center">
          <KeyRound className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No passkeys yet. Add one to sign in without a password.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {passkeys.map((passkey) => (
            <PasskeyRow
              key={passkey.id}
              id={passkey.id}
              name={passkey.name || "Passkey"}
              createdAtLabel={
                passkey.createdAt
                  ? CREATED_AT_FORMATTER.format(new Date(passkey.createdAt))
                  : ""
              }
              deviceType={passkey.deviceType}
              backedUp={passkey.backedUp}
            />
          ))}
        </div>
      )}

      <AddPasskeyButton disabled={atLimit} />

      {atLimit && (
        <p className="text-xs text-muted-foreground">
          You can have at most{" "}
          <span className="font-semibold text-foreground/80">
            {LIMITS.auth.maxPasskeys}
          </span>{" "}
          passkeys. Remove one to add another.
        </p>
      )}
    </div>
  );
}
