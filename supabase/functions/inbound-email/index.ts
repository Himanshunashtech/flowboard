import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID().slice(0, 8);
  console.log(`[${requestId}] Inbound request received`);

  const contentType = req.headers.get("content-type") || "";
  let subject = "";
  let text = "";
  let html = "";
  let to = "";
  let from = "";

  try {
    if (contentType.includes("application/json")) {
      const payload = await req.json();
      console.log(`[${requestId}] Parsing JSON payload`);
      subject = payload.subject;
      text = payload.text;
      html = payload.html;
      to = payload.to;
      from = payload.from;
    } else {
      console.log(`[${requestId}] Parsing FormData payload`);
      const formData = await req.formData();
      subject = formData.get("subject") as string;
      text = formData.get("text") as string;
      html = formData.get("html") as string;
      to = formData.get("to") as string;
      from = formData.get("from") as string;
    }

    console.log(`[${requestId}] Context: From=${from}, To=${to}, Subject=${subject}`);

    if (!to) {
      console.error(`[${requestId}] Error: Missing recipient address (to)`);
      throw new Error("Missing recipient address");
    }

    // 1. Robust extraction: Find all emails in the 'to' string
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const recipientEmails = to.match(emailRegex)?.map(e => e.toLowerCase().trim()) || [];
    
    if (recipientEmails.length === 0) {
      console.error(`[${requestId}] Error: Could not extract any valid email from: ${to}`);
      throw new Error("Invalid recipient format");
    }

    console.log(`[${requestId}] Potential capture addresses: ${recipientEmails.join(', ')}`);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Try to find a matching profile for any of the recipient addresses
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, inbound_capture_email')
      .in('inbound_capture_email', recipientEmails)

    if (profileError) {
       console.error(`[${requestId}] Profile lookup error:`, profileError);
       throw profileError;
    }

    if (!profiles || profiles.length === 0) {
      console.error(`[${requestId}] No profile found matching any recipient in: ${recipientEmails.join(', ')}`);
      return new Response(JSON.stringify({ 
        error: "Invalid capture address", 
        detail: `The address ${recipientEmails.join(' or ')} is not registered in our system.`
      }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const profile = profiles[0];
    console.log(`[${requestId}] Found matching profile: ${profile.id} for capture: ${profile.inbound_capture_email}`);

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

    if (insertError) {
      console.error(`[${requestId}] Database insert error:`, insertError);
      throw insertError;
    }

    console.log(`[${requestId}] Successfully captured mail: ${inboxItem.id}`);
    return new Response(JSON.stringify({ success: true, id: inboxItem.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error(`[${requestId}] Request failed:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
