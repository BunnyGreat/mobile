export type OtpEmailType = "registration" | "password-reset";

export type OtpEmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

declare const Deno: {
  env: { get(name: string): string | undefined };
};

export async function sendOtpEmail(
  email: string,
  otpCode: string,
  type: OtpEmailType,
): Promise<OtpEmailResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("[otp-email] RESEND_API_KEY is not configured");
    return { success: false, error: "Email service is not configured." };
  }

  const subject =
    type === "password-reset"
      ? "Barangay San Isidro Password Reset Code"
      : "Barangay San Isidro Verification Code";
  const messageContext =
    type === "password-reset" ? "Password reset" : "Email verification";

  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header, .content, .footer { text-align: center; }
          .header { margin-bottom: 30px; }
          .code-box { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .code { font-size: 48px; font-weight: bold; letter-spacing: 5px; color: #2563eb; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h2>Barangay San Isidro</h2></div>
          <div class="content">
            <h3>${messageContext}</h3>
            <p>Your verification code is:</p>
            <div class="code-box"><div class="code">${otpCode}</div></div>
            <p>This code expires in 5 minutes.</p>
            <p>Do not share this code with anyone.</p>
          </div>
          <div class="footer">
            <p>If you did not request this code, please ignore this email.</p>
            <p>&copy; 2026 Barangay San Isidro. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Barangay San Isidro <noreply@barangay-san-isidro.help>",
        to: [email],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      console.error("[otp-email] Resend rejected the email", response.status);
      return {
        success: false,
        error: "Failed to send verification code.",
      };
    }

    const result = (await response.json()) as { id?: string };
    return { success: true, messageId: result.id };
  } catch (error: unknown) {
    console.error(
      "[otp-email] Email delivery failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return { success: false, error: "Failed to send verification code." };
  }
}
