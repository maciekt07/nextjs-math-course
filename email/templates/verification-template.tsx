import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { AUTH_LIMITS } from "@/lib/constants/limits";

interface VerificationEmailProps {
  url: string;
  name: string;
}

const hours = AUTH_LIMITS.verificationTokenTTL / 3600;

const VerificationEmailTemplate = ({ url, name }: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your email</Preview>

    <Tailwind>
      <Body className="bg-gray-50 font-sans py-10">
        <Container className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <Heading className="text-2xl font-semibold text-gray-900 mb-4">
            Hi, {name} 👋
          </Heading>

          <Text className="text-gray-600 leading-relaxed mb-6">
            Welcome to <strong>Math Course Online</strong>. Please verify your
            email address to finish creating your account.
          </Text>

          <Section className="text-center my-8">
            <Link
              href={url}
              className="inline-block rounded-xl bg-black px-6 py-3 text-white text-sm font-medium no-underline"
            >
              Verify email
            </Link>
          </Section>

          <Hr className="border-gray-200 my-6" />

          <Text className="text-xs text-gray-500 text-center">
            This link expires in {hours} hours.
          </Text>

          <Text className="text-xs text-gray-400 text-center mt-2">
            If you didn't create an account, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default VerificationEmailTemplate;
