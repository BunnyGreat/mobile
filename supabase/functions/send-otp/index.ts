import { sendOtpEmail } from "../_shared/sendOtpEmail.ts";

declare const Deno: {
  serve(handler: (request: Request) => Promise<Response>): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed." }, 405);
  }

  try {
    const body = (await request.json()) as {
      email?: unknown;
      otpCode?: unknown;
      type?: unknown;
    };
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const otpCode = typeof body.otpCode === "string" ? body.otpCode : "";
    const type = body.type ?? "registration";

    if (type !== "registration") {
      return jsonResponse(
        {
          success: false,
          error: "Password reset codes are managed by the secure reset flow.",
        },
        410,
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse(
        { success: false, error: "Invalid email address." },
        400,
      );
    }
    if (!/^\d{6}$/.test(otpCode)) {
      return jsonResponse({ success: false, error: "Invalid OTP format." }, 400);
    }

    const result = await sendOtpEmail(email, otpCode, "registration");
    return jsonResponse(result, result.success ? 200 : 500);
  } catch (error: unknown) {
    console.error(
      "[send-otp] Request failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return jsonResponse(
      { success: false, error: "Unable to send verification code." },
      500,
    );
  }
});
