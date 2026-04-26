import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const url = new URL(req.url)
  const workspaceId = url.searchParams.get('workspace')
  const token = url.searchParams.get('token')
  const gitlabSecret = req.headers.get('x-gitlab-token')

  if (!workspaceId || !token || !gitlabSecret) {
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
    .eq('service', 'GITLAB')
    .single()

  if (!webhook || webhookError) {
    return new Response("Unauthorized: Invalid webhook configuration", { status: 401 })
  }

  // 2. Verify GitLab Secret (Token match)
  if (gitlabSecret !== webhook.webhook_secret) {
    return new Response("Unauthorized: Invalid secret", { status: 401 })
  }

  const payload = await req.json()
  const event = req.headers.get('x-gitlab-event')

  // 3. Handle Merge Request Merged
  if (event === 'Merge Request Hook' && payload.object_attributes?.action === 'merge') {
    const mr = payload.object_attributes
    const mrUrl = mr.url
    const mrTitle = mr.title
    const mrBody = mr.description || ""
    const branchName = mr.source_branch

    // Extract task number
    const taskMatch = (mrTitle + " " + mrBody + " " + branchName).match(/(?:#|task-)(\d+)/i)
    
    if (taskMatch) {
      const taskNumber = parseInt(taskMatch[1])

      const { data: card } = await supabase
        .from('cards')
        .select('id, board_id')
        .eq('task_number', taskNumber)
        .single()

      if (card) {
        // Link the MR
        await supabase.from('card_external_links').upsert({
          card_id: card.id,
          service: 'gitlab_mr',
          external_id: mr.id.toString(),
          external_url: mrUrl,
          title: mrTitle,
          status: 'merged'
        })

        // Auto-move
        const targetListId = webhook.config?.target_list_id
        if (targetListId) {
          await supabase.from('cards').update({ list_id: targetListId }).eq('id', card.id)
        } else if (webhook.config?.move_to_status === 'done') {
          const { data: doneList } = await supabase
            .from('lists')
            .select('id')
            .eq('board_id', card.board_id)
            .ilike('title', '%done%')
            .limit(1)
            .single()

          if (doneList) {
            await supabase.from('cards').update({ list_id: doneList.id }).eq('id', card.id)
          }
        }
      }
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  })
})
