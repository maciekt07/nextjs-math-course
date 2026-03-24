import { Heading, Hr, Text } from "@react-email/components";
import { AUTH_LIMITS } from "@/lib/constants/limits";
import { formatSeconds } from "@/lib/format";
import EmailButton from "../components/email-button";
import EmailLayout from "../components/email-layout";

interface VerificationEmailProps {
  url: string;
  name: string;
}

export default function VerificationEmailTemplate({
  url,
  name,
}: VerificationEmailProps) {
  const parsedUrl = new URL(url);

  const callback = parsedUrl.searchParams.get("callbackURL");

  // better auth reuses the same callback for request email change and verify new email with no control over it
  const isEmailChange = callback === "/auth/verify-email-change";

  if (isEmailChange) {
    parsedUrl.searchParams.set("callbackURL", `${callback}?success=true`);
  }

  const finalUrl = parsedUrl.toString();
  return (
    <EmailLayout preview="Verify your email">
      <Heading className="text-2xl font-semibold text-gray-900 mb-4">
        Hi, {name}
      </Heading>

      {isEmailChange ? (
        <Text className="text-gray-600 leading-relaxed mb-6">
          You recently requested to change your email address. Please verify
          your new email by clicking the button below to complete the update.
        </Text>
      ) : (
        <Text className="text-gray-600 leading-relaxed mb-6">
          Welcome to <strong>Math Course Online</strong>. Please verify your
          email.
        </Text>
      )}

      <EmailButton url={finalUrl}>
        {isEmailChange ? "Confirm Email Change" : "Verify email"}
      </EmailButton>

      <Hr className="border-gray-200 my-6" />

      <Text className="text-xs text-gray-600 text-center">
        This link expires in {formatSeconds(AUTH_LIMITS.verificationTokenTTL)}.
      </Text>

      {isEmailChange ? (
        <Text className="text-gray-600 leading-relaxed mb-6">
          If you didn't request this change, you can safely ignore this email.
        </Text>
      ) : (
        <Text className="text-xs text-gray-500 text-center">
          If you didn't create an account, you can safely ignore this email.
        </Text>
      )}
    </EmailLayout>
  );
}
