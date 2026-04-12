import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record } = await req.json()
    const { payload, recipient } = record

    // 1. Fetch Extra Context (Workspace Name)
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('name')
      .eq('id', payload.workspace_id)
      .single()

    const workspaceName = workspace?.name || 'a FlowBoard Workspace'
    const joinUrl = `${req.headers.get('origin') || 'https://flowboard.app'}/join?token=${payload.token}`

    // 2. Draft the Premium HTML Email
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px; }
            .container { max-width: 580px; margin: 0 auto; background: white; border-radius: 32px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
            .header { padding: 40px; text-align: center; background: #4F46E5; }
            .content { padding: 40px; text-align: center; }
            h1 { font-size: 24px; font-weight: 900; color: #1e293b; margin: 0 0 16px; letter-spacing: -0.02em; }
            p { font-size: 16px; color: #64748b; line-height: 1.6; margin: 0 0 32px; }
            .button { display: inline-block; padding: 16px 32px; background: #4F46E5; color: white !important; text-decoration: none; border-radius: 16px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.2s; }
            .footer { padding: 32px; background: #f8fafc; text-align: center; border-top: 1px solid #f1f5f9; }
            .footer-text { font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h1>Invitation to join ${workspaceName}</h1>
              <p>You've been invited to collaborate on FlowBoard. Join your team to start organizing with kinetic flow.</p>
              <a href="${joinUrl}" class="button">Accept Invitation</a>
            </div>
            <div class="footer">
              <span class="footer-text">FlowBoard • Kinetic Collaboration</span>
            </div>
          </div>
        </body>
      </html>
    `

    // 3. Send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'FlowBoard <invites@resend.dev>',
        to: [recipient],
        subject: `Join ${workspaceName} on FlowBoard`,
        html: html,
      }),
    })

    const result = await res.json()

    // 4. Update Queue Status
    await supabase
      .from('mail_queue')
      .update({ status: 'SENT', updated_at: new Date().toISOString() })
      .eq('id', record.id)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
