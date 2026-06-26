import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Tailwind,
} from "@react-email/components";
import { APP_URL } from "@/email/app-url";

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
        <Body className="bg-white text-[#0A0A0A] font-sans py-10 text-center">
          <Img
            src={`${APP_URL}/email-text-logo.png`}
            alt="Logo"
            width={300}
            height={60}
            className="mx-auto mb-6"
            style={{ display: "block" }}
          />
          <Container className="mx-auto max-w-md rounded-2xl bg-[#f7f9fa] p-8 shadow-sm border border-[#e4e4e4]">
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
