// deno-lint-ignore-file no-explicit-any
// NOTE: This file is a Supabase Edge Function (Deno runtime, not Node.js)
// VSCode IDE may show type warnings for JSR modules and Deno APIs,
// but these resolve correctly when deployed to Supabase.
// The main app TypeScript compilation (npx tsc --noEmit) passes without errors.

interface SendOtpRequest {
  email: string;
  otpCode: string;
  type?: "registration" | "password-reset";
}

interface SendOtpResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Supabase Edge Function environment variable access
declare const Deno: any;

const RESEND_API_KEY = (Deno as any).env?.get("RESEND_API_KEY");

async function sendOtpEmail(
  email: string,
  otpCode: string,
  type: "registration" | "password-reset" = "registration"
): Promise<SendOtpResponse> {
  if (!RESEND_API_KEY) {
    console.error("[send-otp] RESEND_API_KEY not configured in Supabase secrets");
    return {
      success: false,
      error: "Email service is not configured. Please try again later.",
    };
  }

  if (!email || !otpCode) {
    return {
      success: false,
      error: "Invalid OTP email payload.",
    };
  }

  const resendSender = "Barangay San Isidro <noreply@barangay-san-isidro.help>";
  
  const subjectMap = {
    registration: "Barangay San Isidro Verification Code",
    "password-reset": "Barangay San Isidro Password Reset Code",
  };

  const subject = subjectMap[type];
  const messageContext = type === "password-reset" ? "Password reset" : "Email verification";

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { text-align: center; }
          .code-box { 
            background: #f5f5f5; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
          }
          .code { 
            font-size: 48px; 
            font-weight: bold; 
            letter-spacing: 5px;
            color: #2563eb;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            font-size: 12px; 
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Barangay San Isidro</h2>
          </div>
          <div class="content">
            <h3>${messageContext}</h3>
            <p>Your verification code is:</p>
            <div class="code-box">
              <div class="code">${otpCode}</div>
            </div>
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
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: resendSender,
        to: [email],
        subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("[send-otp] Resend API error:", response.status, errorData);
      
      // Return a generic error message to client (don't expose API details)
      return {
        success: false,
        error: "Failed to send verification code. Please try again.",
      };
    }

    const data = await response.json() as { id?: string };
    console.log("[send-otp] OTP sent successfully:", {
      email,
      messageId: data.id,
      type,
    });

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    console.error("[send-otp] Error sending OTP:", error);
    return {
      success: false,
      error: "Failed to send verification code. Please try again.",
    };
  }
}

(Deno as any).serve(async (req: any) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json() as SendOtpRequest;
    const { email, otpCode, type = "registration" } = body;

    // Validate input
    if (!email || !otpCode) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing email or OTP code",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid email address",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otpCode)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid OTP format",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await sendOtpEmail(email, otpCode, type);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("[send-otp] Unhandled error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
