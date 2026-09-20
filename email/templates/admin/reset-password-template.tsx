import { Heading, Hr, Text } from "@react-email/components";
import EmailButton from "@/email/components/email-button";
import EmailLayout from "@/email/components/email-layout";
import { LIMITS } from "@/lib/constants/limits";
import { APP_NAME } from "@/lib/constants/site";
import { formatSeconds } from "@/lib/format";

interface AdminResetPasswordEmailProps {
  url: string;
  email: string;
}

const AdminResetPasswordEmailTemplate = Object.assign(
  function AdminResetPasswordEmailTemplate({
    url,
    email,
  }: AdminResetPasswordEmailProps) {
    const expiresIn = formatSeconds(LIMITS.auth.resetPasswordTokenTTL);

    return (
      <EmailLayout preview="Reset your admin password">
        <Heading className="mb-4 text-2xl font-semibold text-gray-900">
          Reset your admin password
        </Heading>

        <Text className="mb-6 leading-relaxed text-gray-600">
          We received a request to reset the admin password for {email} on{" "}
          <strong>{APP_NAME}</strong>.
        </Text>

        <EmailButton url={url}>Reset password</EmailButton>

        <Hr className="my-6 border-gray-200" />

        <Text className="text-center text-xs text-gray-600">
          This link expires in {expiresIn}.
        </Text>

        <Text className="text-center text-xs text-gray-500">
          If you didn&apos;t request a password reset, you can safely ignore
          this email.
        </Text>
      </EmailLayout>
    );
  },
  {
    PreviewProps: {
      email: "admin@example.com",
      url: "https://nextjs-math-course.vercel.app/admin/reset/preview-token",
    } satisfies AdminResetPasswordEmailProps,
  },
);

export default AdminResetPasswordEmailTemplate;
