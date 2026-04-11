import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const WEBHOOK_SECRET = Deno.env.get('GITHUB_WEBHOOK_SECRET')

serve(async (req) => {
  const signature = req.headers.get('x-hub-signature-256')
  const payload = await req.text()

  // 1. Verify Webhook Signature
  if (WEBHOOK_SECRET) {
     const encoder = new TextEncoder()
     const key = await crypto.subtle.importKey(
       "raw", 
       encoder.encode(WEBHOOK_SECRET), 
       { name: "HMAC", hash: "SHA-256" }, 
       false, 
       ["verify"]
     )
     const verified = await crypto.subtle.verify(
       "HMAC", 
       key, 
       hexToUint8Array(signature?.replace('sha256=', '') || ''), 
       encoder.encode(payload)
     )
     if (!verified) return new Response('Invalid signature', { status: 401 })
  }

  const data = JSON.parse(payload)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 2. Log Delivery
  await supabase.from('github_webhook_logs').insert({
    github_delivery_id: req.headers.get('x-github-delivery'),
    event_type: req.headers.get('x-github-event'),
    payload: data
  })

  // 3. Handle Events
  const event = req.headers.get('x-github-event')
  
  if (event === 'pull_request') {
    const pr = data.pull_request
    const { data: linkedItems } = await supabase
      .from('card_github_items')
      .select('*, cards(*)')
      .eq('github_id', pr.id)

    if (linkedItems && linkedItems.length > 0) {
      for (const item of linkedItems) {
        // Update Snapshot
        await supabase.from('card_github_items').update({
          state: pr.merged ? 'MERGED' : pr.state.toUpperCase(),
          last_synced_at: new Date().toISOString()
        }).eq('id', item.id)

        // AUTOMATION: Move to Done if Merged
        if (pr.merged && data.action === 'closed') {
          const { data: doneList } = await supabase
            .from('lists')
            .select('id')
            .eq('board_id', item.cards.board_id)
            .ilike('title', '%done%')
            .single()

          if (doneList) {
            await supabase.from('cards')
              .update({ list_id: doneList.id, is_completed: true })
              .eq('id', item.card_id)
          }
        }
      }
    }
  }

  return new Response('ok', { status: 200 })
})

function hexToUint8Array(hex: string) {
  const view = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    view[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return view
}
