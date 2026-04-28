import "server-only";

import Mux from "@mux/mux-node";
import { serverEnv } from "@/env/server";

export const mux = new Mux({
  tokenId: serverEnv.MUX_TOKEN_ID,
  tokenSecret: serverEnv.MUX_TOKEN_SECRET,
  jwtSigningKey: serverEnv.MUX_JWT_KEY_ID,
  jwtPrivateKey: serverEnv.MUX_JWT_KEY,
});
