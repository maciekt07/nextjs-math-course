import React from "react";
import { describe, expect, it } from "vitest";
import { getText } from "../get-text";

describe("getText", () => {
  it("returns an empty string for nullish and falsy values", () => {
    expect(getText(null)).toBe("");
    expect(getText(undefined)).toBe("");
    expect(getText(false)).toBe("");
  });

  it("returns strings unchanged", () => {
    expect(getText("Hello world")).toBe("Hello world");
  });

  it("converts numbers to strings", () => {
    expect(getText(123)).toBe("123");
    expect(getText(0)).toBe("");
  });

  it("extracts text from arrays", () => {
    expect(getText(["Hello", " ", "world"])).toBe("Hello world");
    expect(getText(["Hello", 123, "!"])).toBe("Hello123!");
  });

  it("extracts value from a text node", () => {
    expect(getText({ value: "Hello world" })).toBe("Hello world");
  });

  it("extracts text recursively from node children", () => {
    expect(
      getText({
        children: [{ value: "Hello " }, { value: "world" }],
      }),
    ).toBe("Hello world");
  });

  it("extracts text from React elements", () => {
    const element = React.createElement("strong", null, "Hello world");

    expect(getText(element)).toBe("Hello world");
  });

  it("extracts text recursively from nested React elements", () => {
    const element = React.createElement(
      "p",
      null,
      "Hello ",
      React.createElement("strong", null, "world"),
      "!",
    );

    expect(getText(element)).toBe("Hello world!");
  });

  it("returns an empty string for unsupported values", () => {
    expect(getText({ foo: "bar" })).toBe("");
    expect(getText({ value: 123 })).toBe("");
    expect(getText({ children: "invalid" })).toBe("");
  });
});
