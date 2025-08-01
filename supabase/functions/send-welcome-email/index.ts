import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
console.log("Welcome email function started with API key:", Deno.env.get("RESEND_API_KEY") ? "✓ API key found" : "✗ API key missing");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email }: WelcomeEmailRequest = await req.json();
    console.log("Processing welcome email request:", JSON.stringify({ name, email }));

    const emailResponse = await resend.emails.send({
      from: "John Deus <onboarding@resend.dev>",
      to: [email],
      subject: "Cảm ơn bạn đã đăng ký nhận email từ John Deus",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; margin-bottom: 20px;">Hi ${name || 'bạn'},</h1>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Cảm ơn ${name || 'bạn'} vì đã đăng ký nhận email, Deus rất trân trọng bạn vì sự đồng hành, 
            Deus viết cho ${name || 'bạn'} nhưng đôi khi cũng là viết cho chính mình.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Những sự thẳng thắn, vì vốn dĩ thế giới này không hề dễ dàng.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Hi ${name || 'friend'},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Thank you ${name || 'friend'} for signing up to receive emails, Deus really appreciates you for your companionship, 
            Deus writes for ${name || 'friend'} but sometimes also writes for himself.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Lights, because this world is inherently not easy.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 14px;">
            <p>Best regards,<br>John Deus</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);
    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);