import { Heading, Hr, Text } from "@react-email/components";
import { APP_URL } from "@/email/app-url";
import { APP_NAME } from "@/lib/constants/site";
import EmailButton from "../components/email-button";
import EmailLayout from "../components/email-layout";

interface AccountReadyEmailProps {
  name: string;
}

const AccountReadyEmailTemplate = Object.assign(
  function AccountReadyEmailTemplate({ name }: AccountReadyEmailProps) {
    return (
      <EmailLayout preview="Your account is ready">
        <Heading className="text-2xl font-semibold text-gray-900 mb-4">
          You are all set, {name}
        </Heading>

        <Text className="text-gray-600 leading-relaxed mb-6">
          Your email has been verified and your <strong>{APP_NAME}</strong>{" "}
          account is ready to use.
        </Text>

        <EmailButton url={APP_URL}>Start learning</EmailButton>

        <Hr className="border-gray-200 my-6" />

        <Text className="text-xs text-gray-500 text-center">
          Thanks for confirming your email. You can now sign in and access your
          courses.
        </Text>
      </EmailLayout>
    );
  },
  {
    PreviewProps: {
      name: "John",
    } satisfies AccountReadyEmailProps,
  },
);

export default AccountReadyEmailTemplate;
