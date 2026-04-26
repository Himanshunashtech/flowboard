import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const url = new URL(req.url)
  const workspaceId = url.searchParams.get('workspace')
  const token = url.searchParams.get('token')
  const signature = req.headers.get('x-hub-signature-256')

  if (!workspaceId || !token || !signature) {
    return new Response("Unauthorized: Missing parameters", { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Verify Webhook configuration
  const { data: webhook, error: webhookError } = await supabase
    .from('workspace_webhooks')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('webhook_token', token)
    .eq('service', 'GITHUB')
    .single()

  if (!webhook || webhookError) {
    return new Response("Unauthorized: Invalid webhook configuration", { status: 401 })
  }

  // 2. Verify HMAC Signature
  const body = await req.text()
  const hmacKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(webhook.webhook_secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  )
  
  const signatureBytes = new Uint8Array(
    signature.replace("sha256=", "").match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  )
  
  const isValid = await crypto.subtle.verify(
    "HMAC",
    hmacKey,
    signatureBytes,
    new TextEncoder().encode(body)
  )

  if (!isValid) {
    return new Response("Unauthorized: Invalid signature", { status: 401 })
  }

  const payload = JSON.parse(body)
  const event = req.headers.get('x-github-event')

  // 3. Handle Pull Request Merged
  if (event === 'pull_request' && payload.action === 'closed' && payload.pull_request.merged) {
    const pr = payload.pull_request
    const prUrl = pr.html_url
    const prTitle = pr.title
    const prBody = pr.body || ""
    const branchName = pr.head.ref

    // Extract task number (e.g., #123 or task-123)
    const taskMatch = (prTitle + " " + prBody + " " + branchName).match(/(?:#|task-)(\d+)/i)
    
    if (taskMatch) {
      const taskNumber = parseInt(taskMatch[1])

      // Find the card
      const { data: card } = await supabase
        .from('cards')
        .select('id, board_id')
        .eq('task_number', taskNumber)
        .single()

      if (card) {
        // Link the PR
        await supabase.from('card_external_links').upsert({
          card_id: card.id,
          service: 'github_pr',
          external_id: pr.id.toString(),
          external_url: prUrl,
          title: prTitle,
          status: 'merged'
        })

        // Auto-move if configured
        const targetListId = webhook.config?.target_list_id
        if (targetListId) {
          await supabase.from('cards')
            .update({ list_id: targetListId })
            .eq('id', card.id)
        } else if (webhook.config?.move_to_status === 'done') {
          // Find the "Done" list on this board
          const { data: doneList } = await supabase
            .from('lists')
            .select('id')
            .eq('board_id', card.board_id)
            .ilike('title', '%done%')
            .limit(1)
            .single()

          if (doneList) {
            await supabase.from('cards')
              .update({ list_id: doneList.id })
              .eq('id', card.id)
          }
        }

        // Add a comment
        await supabase.from('comments').insert({
          card_id: card.id,
          author_id: webhook.workspace_id, // Attributing to workspace for system comments
          content: {
            type: 'doc',
            content: [{
              type: 'paragraph',
              content: [{
                type: 'text',
                text: `PR merged on GitHub: ${prUrl}`
              }]
            }]
          },
          content_text: `PR merged on GitHub: ${prUrl}`
        })
      }
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  })
})
