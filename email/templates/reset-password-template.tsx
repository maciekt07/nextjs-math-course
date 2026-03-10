// email/templates/reset-password-email.tsx

import { Heading, Hr, Text } from "@react-email/components";
import { formatSeconds } from "@/email/utils";
import { AUTH_LIMITS } from "@/lib/constants/limits";
import EmailButton from "../components/email-button";
import EmailLayout from "../components/email-layout";

export interface ResetPasswordEmailProps {
  url: string;
  name: string;
}

export default function ResetPasswordEmailTemplate({
  url,
  name,
}: ResetPasswordEmailProps) {
  return (
    <EmailLayout preview="Reset your password">
      <Heading className="text-2xl font-semibold text-gray-900 mb-4">
        Hi, {name}
      </Heading>

      <Text className="text-gray-600 leading-relaxed mb-6">
        We received a request to reset your password.
      </Text>

      <EmailButton url={url}>Reset password</EmailButton>

      <Hr className="border-gray-200 my-6" />

      <Text className="text-xs text-gray-600 text-center">
        This link expires in {formatSeconds(AUTH_LIMITS.resetPasswordTokenTTL)}.
      </Text>

      <Text className="text-xs text-gray-500 text-center">
        If you didn't request a password reset, you can safely ignore this
        email.
      </Text>
    </EmailLayout>
  );
}
