import { Heading, Text } from "@react-email/components";
import EmailLayout from "@/email/components/email-layout";

interface CronFailureEmailProps {
  message: string;
  timestamp: string;
}

const CronFailureEmailTemplate = Object.assign(
  function CronFailureEmailTemplate({
    message,
    timestamp,
  }: CronFailureEmailProps) {
    const timeZone = "Europe/Warsaw";
    const formattedTimestamp = new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
      timeZone,
    }).format(new Date(timestamp));

    return (
      <EmailLayout preview="Scheduled publishing failed">
        <Heading className="mb-4 text-2xl font-semibold text-gray-900">
          Scheduled publishing failed
        </Heading>
        <Text className="mb-4 text-left leading-relaxed text-gray-600">
          The scheduled course publishing job failed. QStash will retry the
          request if retries remain.
        </Text>
        <Text className="rounded-lg bg-gray-100 p-4 text-left font-mono text-sm text-gray-700">
          {message}
        </Text>
        <Text className="mt-4 text-left text-xs text-gray-500">
          Failed at {formattedTimestamp} ({timeZone})
        </Text>
      </EmailLayout>
    );
  },
  {
    PreviewProps: {
      message: "Payload job runner returned status 502",
      timestamp: "2026-09-02T18:25:18.533Z",
    } satisfies CronFailureEmailProps,
  },
);

export default CronFailureEmailTemplate;
