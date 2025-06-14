
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Helper to create email HTML with results, topic, and images
function formatEmailHTML({ topic, results, images }: { topic: string; results: string; images: string[] }): string {
  let html = `<h2>AI Extraction Results</h2>`;
  if (topic) {
    html += `<p><strong>Topic:</strong> ${topic}</p>`;
  }
  html += `<pre style="background:#222;color:#8ff;padding:1em;border-radius:8px;">${results}</pre>`;
  if (images && images.length) {
    html += `<h3>Extracted Images</h3>`;
    images.forEach((img, idx) => {
      html += `<div style="margin-bottom:8px;"><img src="${img}" alt="Extracted ${idx+1}" style="max-width:300px;max-height:160px;display:block;margin-bottom:2px;"/><a href="${img}" target="_blank">${img}</a></div>`;
    });
  }
  html += `<hr/><p style="font-size:12px;color:#888;">Sent by AI Extraction App</p>`;
  return html;
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, results, topic, images } = await req.json();
    if (!to || !results) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = formatEmailHTML({ topic, results, images: images || [] });
    const subject = topic
      ? `AI Extraction Results: ${topic}`
      : "AI Extraction Results";

    const emailResponse = await resend.emails.send({
      from: "Lovable <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error emailing results:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
