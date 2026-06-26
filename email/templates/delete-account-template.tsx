import { Heading, Hr, Text } from "@react-email/components";
import { LIMITS } from "@/lib/constants/limits";
import { APP_NAME } from "@/lib/constants/site";
import { formatSeconds } from "@/lib/format";
import EmailButton from "../components/email-button";
import EmailLayout from "../components/email-layout";

interface DeleteAccountEmailProps {
  url: string;
  name: string;
}

const DeleteAccountEmailTemplate = Object.assign(
  function DeleteAccountEmailTemplate({ url, name }: DeleteAccountEmailProps) {
    const expiresIn = formatSeconds(LIMITS.auth.deleteTokenTTL);

    return (
      <EmailLayout preview="Confirm account deletion">
        <Heading className="text-2xl font-semibold text-gray-900 mb-4">
          Delete your account, {name}?
        </Heading>

        <Text className="text-gray-600 leading-relaxed mb-6">
          We received a request to permanently delete your{" "}
          <strong>{APP_NAME}</strong> account. This will remove your account
          data and cannot be undone.
        </Text>

        <EmailButton url={url} className="bg-[#e70000]">
          Delete account
        </EmailButton>

        <Hr className="border-gray-200 my-6" />

        <Text className="text-xs text-gray-600 text-center">
          This link expires in {expiresIn}.
        </Text>

        <Text className="text-xs text-gray-500 text-center">
          If you did not request this, you can safely ignore this email. Your
          account will remain active.
        </Text>
      </EmailLayout>
    );
  },
  {
    PreviewProps: {
      name: "John",
      url: "https://nextjs-math-course.vercel.app/api/auth/delete-user/callback?token=preview-token",
    } satisfies DeleteAccountEmailProps,
  },
);

export default DeleteAccountEmailTemplate;
