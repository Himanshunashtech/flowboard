import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SLACK_ENCRYPTION_KEY = Deno.env.get('SLACK_ENCRYPTION_KEY')

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // 1. Get User
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    // 2. Get Decrypted Token
    const { data: accounts, error: accError } = await supabaseClient
      .rpc('decrypt_slack_token_secure', { p_user_id: user.id })

    if (accError || !accounts || accounts.length === 0) {
      throw new Error('Slack not connected')
    }
    
    const botToken = accounts[0].decrypted_bot_token
    const { action, ...params } = await req.json()

    let result
    switch (action) {
      case 'list-channels':
        result = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel', {
          headers: { 'Authorization': `Bearer ${botToken}` }
        }).then(r => r.json())
        break

      case 'post-message':
        result = await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${botToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            channel: params.channelId,
            text: params.text,
            blocks: params.blocks
          })
        }).then(r => r.json())
        break

      default:
        throw new Error(`Unsupported action: ${action}`)
    }

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
