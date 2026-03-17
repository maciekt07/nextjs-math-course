import "server-only";

import { Resend } from "resend";
import { serverEnv } from "@/env/server";

export const resend = new Resend(serverEnv.RESEND_API_KEY);
