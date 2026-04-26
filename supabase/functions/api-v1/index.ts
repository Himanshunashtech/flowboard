import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const url = new URL(req.url)
  const authHeader = req.headers.get('Authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: "Missing or invalid API key" }), { status: 401 })
  }

  const apiKey = authHeader.replace('Bearer ', '')
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Verify API Key
  // Note: In production, we'd hash the key before comparing
  // For this implementation, we assume key_hash stores the raw key for simplicity or hash it here
  const { data: keyData, error: keyError } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_hash', apiKey) // Ideally use SHA-256 here
    .single()

  if (!keyData || keyError) {
    return new Response(JSON.stringify({ error: "Invalid API key" }), { status: 401 })
  }

  const workspaceId = keyData.workspace_id
  const method = req.method
  const path = url.pathname.split('/').pop()

  // 2. Handle Endpoints
  try {
    switch (path) {
      case 'submitTask':
        if (method !== 'POST') return new Response("Method not allowed", { status: 405 })
        const body = await req.json()
        
        // Find default board/list if none provided
        let boardId = body.boardId
        let listId = body.listId
        
        if (!boardId) {
          const { data: board } = await supabase.from('boards').select('id').eq('workspace_id', workspaceId).limit(1).single()
          boardId = board?.id
        }
        
        if (!listId && boardId) {
          const { data: list } = await supabase.from('lists').select('id').eq('board_id', boardId).order('position').limit(1).single()
          listId = list?.id
        }

        const { data: newCard, error: createError } = await supabase.from('cards').insert({
          board_id: boardId,
          list_id: listId,
          title: body.title,
          description_text: body.description,
          created_by: workspaceId, // Attributing to the workspace
        }).select().single()

        if (createError) throw createError
        
        return new Response(JSON.stringify({ 
          id: newCard.id, 
          taskNumber: newCard.task_number,
          message: "Task submitted successfully" 
        }), { status: 201 })

      case 'getTasks':
        if (method !== 'GET') return new Response("Method not allowed", { status: 405 })
        const status = url.searchParams.get('status')
        
        let query = supabase.from('cards').select('*').eq('is_archived', false)
        
        // Filter by boards in this workspace
        const { data: boards } = await supabase.from('boards').select('id').eq('workspace_id', workspaceId)
        const boardIds = boards?.map(b => b.id) || []
        query = query.in('board_id', boardIds)

        if (status) query = query.eq('status', status)
        
        const { data: tasks, error: fetchError } = await query.limit(100)
        if (fetchError) throw fetchError

        return new Response(JSON.stringify({ tasks, count: tasks.length }), { status: 200 })

      case 'updateTask':
        if (method !== 'PATCH') return new Response("Method not allowed", { status: 405 })
        const taskId = url.searchParams.get('taskId')
        const updates = await req.json()
        
        if (!taskId) return new Response("taskId is required", { status: 400 })

        const { error: updateError } = await supabase.from('cards')
          .update({
            list_id: updates.listId,
            is_completed: updates.status === 'done'
          })
          .eq('id', taskId)

        if (updateError) throw updateError
        
        return new Response(JSON.stringify({ success: true, message: "Task updated successfully" }), { status: 200 })

      default:
        return new Response("Not found", { status: 404 })
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
