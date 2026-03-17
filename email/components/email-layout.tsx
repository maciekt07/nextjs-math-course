import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
} from "@react-email/components";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export default function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>

      <Tailwind>
        <Body className="bg-gray-50 font-sans py-10 text-center">
          <Container className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
