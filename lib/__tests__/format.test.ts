import { describe, expect, it } from "vitest";
import { formatDuration, formatReadingTime, formatSeconds } from "@/lib/format";

describe("formatDuration", () => {
  it("formats zero", () => expect(formatDuration(0)).toBe("0:00"));
  it("pads single-digit seconds", () => expect(formatDuration(5)).toBe("0:05"));
  it("formats exactly one minute", () =>
    expect(formatDuration(60)).toBe("1:00"));
  it("formats mixed minutes and seconds", () =>
    expect(formatDuration(803)).toBe("13:23"));
  it("does not pad minutes", () => expect(formatDuration(600)).toBe("10:00"));
  it("floors fractional seconds", () =>
    expect(formatDuration(70.9)).toBe("1:10"));
});

describe("formatReadingTime", () => {
  it("returns '1 min read' for 0 seconds", () =>
    expect(formatReadingTime(0)).toBe("1 min read"));
  it("returns '1 min read' for less than 30s", () =>
    expect(formatReadingTime(29)).toBe("1 min read"));
  it("returns '1 min read' for exactly 60s", () =>
    expect(formatReadingTime(60)).toBe("1 min read"));
  it("rounds up to next minute", () =>
    expect(formatReadingTime(90)).toBe("2 min read"));
  it("rounds down correctly", () =>
    expect(formatReadingTime(149)).toBe("2 min read"));
  it("formats larger values", () =>
    expect(formatReadingTime(600)).toBe("10 min read"));
});

describe("formatSeconds", () => {
  it("singular second", () => expect(formatSeconds(1)).toBe("1 second"));
  it("plural seconds", () => expect(formatSeconds(45)).toBe("45 seconds"));
  it("boundary: 59 seconds", () =>
    expect(formatSeconds(59)).toBe("59 seconds"));
  it("singular minute", () => expect(formatSeconds(60)).toBe("1 minute"));
  it("plural minutes", () => expect(formatSeconds(180)).toBe("3 minutes"));
  it("boundary: 3599 seconds -> 59 minutes", () =>
    expect(formatSeconds(3599)).toBe("59 minutes"));
  it("singular hour", () => expect(formatSeconds(3600)).toBe("1 hour"));
  it("plural hours", () => expect(formatSeconds(7200)).toBe("2 hours"));
  it("boundary: 86399 seconds -> 23 hours", () =>
    expect(formatSeconds(86399)).toBe("23 hours"));
  it("singular day", () => expect(formatSeconds(86400)).toBe("1 day"));
  it("plural days", () => expect(formatSeconds(86400 * 5)).toBe("5 days"));
});
