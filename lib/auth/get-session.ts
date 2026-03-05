import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./auth";

type GetSessionParams = Parameters<typeof auth.api.getSession>[0];

export const getServerSession = cache(
  async (params?: Omit<GetSessionParams, "headers">) => {
    return auth.api.getSession({
      ...params,
      headers: await headers(),
    });
  },
);
