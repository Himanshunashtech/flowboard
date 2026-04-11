import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const body = await req.formData()
  const command = body.get('command')
  const text = body.get('text') as string
  const channelId = body.get('channel_id')
  const userId = body.get('user_id')

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Locate board associated with this Slack channel
  const { data: mapping } = await supabase
    .from('board_slack_channels')
    .select('board_id, boards(title)')
    .eq('channel_id', channelId)
    .single()

  if (!mapping) {
    return new Response(JSON.stringify({
      response_type: 'ephemeral',
      text: "❌ This channel isn't linked to a FlowBoard yet. Link it in Board Settings!"
    }), { headers: { 'Content-Type': 'application/json' } })
  }

  const boardId = mapping.board_id
  let responseText = ""

  // 2. Handle Commands
  if (text.startsWith('add ')) {
    const title = text.replace('add ', '')
    const { data: firstList } = await supabase
      .from('lists')
      .select('id')
      .eq('board_id', boardId)
      .order('position', { ascending: true })
      .limit(1)
      .single()

    if (firstList) {
      await supabase.from('cards').insert({
        board_id: boardId,
        list_id: firstList.id,
        title: title,
        description_text: `Created via Slack by ${userId}`
      })
      responseText = `✅ Added *"${title}"* to ${mapping.boards.title}`
    }
  } else if (text === 'list') {
    const { data: cards } = await supabase
      .from('cards')
      .select('title, is_completed')
      .eq('board_id', boardId)
      .eq('is_completed', false)
      .limit(5)

    responseText = `*Active tasks on ${mapping.boards.title}:*\n` + 
      cards.map(c => `• ${c.title}`).join('\n')
  } else {
    responseText = "👋 Available commands:\n• `add [title]` - Create a new card\n• `list` - See top 5 active cards"
  }

  return new Response(JSON.stringify({
    response_type: 'in_channel',
    text: responseText
  }), { headers: { 'Content-Type': 'application/json' } })
})
