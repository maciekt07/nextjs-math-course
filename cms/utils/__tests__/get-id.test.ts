import { describe, expect, it } from "vitest";
import { getId } from "../get-id";

describe("getId", () => {
  it("returns the string when given a string", () => {
    expect(getId("abc")).toBe("abc");
  });

  it("returns the id when given an object", () => {
    expect(getId({ id: "abc" })).toBe("abc");
  });

  it("returns null for null or undefined", () => {
    expect(getId(null)).toBeNull();
    expect(getId(undefined)).toBeNull();
  });
});
