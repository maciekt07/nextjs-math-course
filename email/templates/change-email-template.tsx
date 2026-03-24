import { Heading, Hr, Text } from "@react-email/components";
import EmailButton from "../components/email-button";
import EmailLayout from "../components/email-layout";

interface ChangeEmailEmailProps {
  url: string;
  name: string;
  newEmail: string;
}

export default function ChangeEmailEmailTemplate({
  url,
  name,
  newEmail,
}: ChangeEmailEmailProps) {
  return (
    <EmailLayout preview="Approve your email change">
      <Heading className="text-2xl font-semibold text-gray-900 mb-4">
        Hi, {name}
      </Heading>

      <Text className="text-gray-600 leading-relaxed mb-6">
        We received a request to change your email to{" "}
        <strong>{newEmail}</strong>.
      </Text>

      <EmailButton url={url}>Change Email</EmailButton>

      <Hr className="border-gray-200 my-6" />

      <Text className="text-xs text-gray-500 text-center">
        If you didn't request an email change, you can safely ignore this email.
        Your email will remain unchanged.
      </Text>
    </EmailLayout>
  );
}
