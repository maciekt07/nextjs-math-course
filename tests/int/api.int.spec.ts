import { getPayload, type Payload } from "payload";
import { beforeAll, describe, expect, it } from "vitest";
import config from "@/payload.config";

let payload: Payload;

describe("API", () => {
  beforeAll(async () => {
    const payloadConfig = await config;
    payload = await getPayload({ config: payloadConfig });
  });

  it("fetches users", async () => {
    const users = await payload.find({
      collection: "users",
    });
    expect(users).toBeDefined();
  });
});
