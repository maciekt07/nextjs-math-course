import { describe, expect, it } from "vitest";
import { buildPublicFileURL } from "@/lib/storage/build-url";

describe("buildPublicFileURL", () => {
  it("builds a URL from bucket, cdnURL, and filename", () => {
    expect(
      buildPublicFileURL({
        bucket: "media-public",
        cdnURL: "https://cdn.example.com",
        filename: "photo.jpg",
      }),
    ).toBe("https://cdn.example.com/media-public/photo.jpg");
  });

  it("includes prefix in the key", () => {
    expect(
      buildPublicFileURL({
        bucket: "media-public",
        cdnURL: "https://cdn.example.com",
        filename: "photo.jpg",
        prefix: "lessons/1",
      }),
    ).toBe("https://cdn.example.com/media-public/lessons/1/photo.jpg");
  });

  it("normalizes slashes from cdnURL and prefix", () => {
    expect(
      buildPublicFileURL({
        bucket: "media-public",
        cdnURL: "https://cdn.example.com//",
        filename: "photo.png",
        prefix: "/lessons/1/",
      }),
    ).toBe("https://cdn.example.com/media-public/lessons/1/photo.png");
  });

  it("throws when bucket is missing", () => {
    expect(() =>
      buildPublicFileURL({
        bucket: "",
        cdnURL: "https://cdn.example.com",
        filename: "a.jpg",
      }),
    ).toThrow(/bucket/);
  });

  it("throws when cdnURL is missing", () => {
    expect(() =>
      buildPublicFileURL({
        bucket: "media-public",
        cdnURL: "",
        filename: "a.jpg",
      }),
    ).toThrow(/cdnURL/);
  });

  it("throws when filename is missing", () => {
    expect(() =>
      buildPublicFileURL({
        bucket: "media-public",
        cdnURL: "https://cdn.example.com",
        filename: "",
      }),
    ).toThrow(/filename/);
  });
});
