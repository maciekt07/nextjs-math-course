import { Heading, Hr, Text } from "@react-email/components";
import { AUTH_LIMITS } from "@/lib/constants/limits";
import { formatSeconds } from "@/lib/format";
import EmailButton from "../components/email-button";
import EmailLayout from "../components/email-layout";

export interface VerificationEmailProps {
  url: string;
  name: string;
}

export default function VerificationEmailTemplate({
  url,
  name,
}: VerificationEmailProps) {
  return (
    <EmailLayout preview="Verify your email">
      <Heading className="text-2xl font-semibold text-gray-900 mb-4">
        Hi, {name}
      </Heading>

      <Text className="text-gray-600 leading-relaxed mb-6">
        Welcome to <strong>Math Course Online</strong>. Please verify your email
        address to finish creating your account.
      </Text>

      <EmailButton url={url}>Verify email</EmailButton>

      <Hr className="border-gray-200 my-6" />

      <Text className="text-xs text-gray-600 text-center">
        This link expires in {formatSeconds(AUTH_LIMITS.verificationTokenTTL)}.
      </Text>

      <Text className="text-xs text-gray-500 text-center">
        If you didn't create an account, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
