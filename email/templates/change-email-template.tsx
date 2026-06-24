import { Heading, Hr, Text } from "@react-email/components";
import { LIMITS } from "@/lib/constants/limits";
import { formatSeconds } from "@/lib/format";
import EmailButton from "../components/email-button";
import EmailLayout from "../components/email-layout";

interface ChangeEmailEmailProps {
  url: string;
  name: string;
  newEmail: string;
}

const ChangeEmailEmailTemplate = Object.assign(
  function ChangeEmailEmailTemplate({
    url,
    name,
    newEmail,
  }: ChangeEmailEmailProps) {
    const expiresIn = formatSeconds(LIMITS.auth.verificationTokenTTL);
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

        <Text className="text-xs text-gray-600 text-center">
          This link expires in {expiresIn}.
        </Text>

        <Text className="text-xs text-gray-500 text-center">
          If you didn't request an email change, you can safely ignore this
          email. Your email will remain unchanged.
        </Text>
      </EmailLayout>
    );
  },
  {
    PreviewProps: {
      name: "John",
      newEmail: "john.doe@example.com",
      url: "https://nextjs-math-course.vercel.app/api/auth/change-email/verify?token=preview-token",
    } satisfies ChangeEmailEmailProps,
  },
);

export default ChangeEmailEmailTemplate;
