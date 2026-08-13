import { describe, expect, it } from "vitest";
import { getRequestedFilename } from "../get-requested-filename";

describe("getRequestedFilename", () => {
  it("returns null when pathname is undefined", () => {
    expect(getRequestedFilename(undefined)).toBeNull();
  });

  it("returns null when pathname is null", () => {
    expect(getRequestedFilename(null)).toBeNull();
  });

  it("returns null when pathname does not contain /file/", () => {
    expect(getRequestedFilename("/api/users")).toBeNull();
  });

  it("returns the filename from a valid path", () => {
    expect(getRequestedFilename("/api/file/document.pdf")).toBe("document.pdf");
  });

  it("returns the filename with trailing slash", () => {
    expect(getRequestedFilename("/api/file/document.pdf/")).toBe(
      "document.pdf",
    );
  });

  it("decodes URL-encoded filenames", () => {
    expect(getRequestedFilename("/api/file/My%20Document.pdf")).toBe(
      "My Document.pdf",
    );
  });

  it("decodes special characters", () => {
    expect(getRequestedFilename("/api/file/%C5%BC%C3%B3%C5%82%C4%87.txt")).toBe(
      "żółć.txt",
    );
  });

  it("returns the last path segment after /file/", () => {
    expect(getRequestedFilename("/api/file/folder/image.png")).toBe(
      "image.png",
    );
  });

  it("returns null for an empty filename", () => {
    expect(getRequestedFilename("/api/file/")).toBeNull();
  });

  it("handles root-level file paths", () => {
    expect(getRequestedFilename("/file/test.txt")).toBe("test.txt");
  });
});
