import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const contentType = req.headers.get("content-type") || "";
  let subject = "";
  let text = "";
  let html = "";
  let to = "";
  let from = "";

  try {
    if (contentType.includes("application/json")) {
      const payload = await req.json();
      subject = payload.subject;
      text = payload.text;
      html = payload.html;
      to = payload.to;
      from = payload.from;
    } else {
      // Handle multipart/form-data (SENDGRID/MAILGUN)
      const formData = await req.formData();
      subject = formData.get("subject") as string;
      text = formData.get("text") as string;
      html = formData.get("html") as string;
      to = formData.get("to") as string;
      from = formData.get("from") as string;
    }

    if (!to) throw new Error("Missing recipient address");

    // 1. Extract capture handle
    const captureEmail = to.split('<').pop()?.split('>')[0]?.toLowerCase().trim() || to.toLowerCase().trim();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Locate the user profile associated with this capture email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('inbound_capture_email', captureEmail)
      .single()

    if (profileError || !profile) {
      console.error(`No profile found for capture email: ${captureEmail}`);
      return new Response(JSON.stringify({ error: "Invalid capture address" }), { status: 404 })
    }

    // 3. Create the inbox item
    const { data: inboxItem, error: insertError } = await supabase
      .from('inbox_items')
      .insert({
        user_id: profile.id,
        title: subject || "Untitled Captures",
        source: 'EMAIL',
        content: {
          from: from,
          body_text: text,
          body_html: html,
          captured_at: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (insertError) throw insertError

    return new Response(JSON.stringify({ success: true, id: inboxItem.id }), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
