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
  Text,
} from "@react-email/components";

interface VerificationEmailProps {
  url: string;
  name: string;
}

const VerificationEmailTemplate = ({ url, name }: VerificationEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Verify your Email</Preview>
      <Container style={container}>
        <Heading style={heading}>Hi {name}!</Heading>
        <Section style={buttonContainer}></Section>
        <Text style={paragraph}>
          Welcome to Math Course Online! Please click the button below to verify
          your email address and complete your registration.
        </Text>
        <Hr style={hr} />
        <Link href={url} style={reportLink}>
          Click here to verify your email address
        </Link>
      </Container>
    </Body>
  </Html>
);

VerificationEmailTemplate.PreviewProps = {
  url: "https://example.com/verify-email",
  name: "Maciej",
} as VerificationEmailProps;

export default VerificationEmailTemplate;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "400",
  color: "#484848",
  padding: "17px 0 0",
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
};

const buttonContainer = {
  padding: "27px 0 27px",
};

const reportLink = {
  fontSize: "14px",
  color: "#b4becc",
};

const hr = {
  borderColor: "#dfe1e4",
  margin: "42px 0 26px",
};
