import { handleGoogleOAuthRedeem } from "../_shared/googleOAuth.ts";

declare const Deno: {
  serve(handler: (request: Request) => Promise<Response>): void;
};

Deno.serve(handleGoogleOAuthRedeem);
