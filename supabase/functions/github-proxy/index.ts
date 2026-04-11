import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Octokit } from "https://esm.sh/@octokit/rest"

const GITHUB_ENCRYPTION_KEY = Deno.env.get('GITHUB_ENCRYPTION_KEY')

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 1. Get User
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    // 2. Get Decrypted Token
    const { data: account, error: accError } = await supabaseClient
      .rpc('decrypt_github_token_secure', { p_user_id: user.id })
      .single()

    if (accError || !account) throw new Error('GitHub account not connected')
    
    const octokit = new Octokit({ auth: account.decrypted_token })
    const { action, ...params } = await req.json()

    let result
    switch (action) {
      case 'search-repos':
        result = await octokit.rest.repos.listForAuthenticatedUser({
          sort: 'updated',
          per_page: 20
        })
        break
      
      case 'search-items':
        const { boardId, query, type } = params
        const { data: repos } = await supabaseClient
          .from('board_repositories')
          .select('repo_full_name')
          .eq('board_id', boardId)

        const repoQuery = repos.map(r => `repo:${r.repo_full_name}`).join(' ')
        const finalQuery = `${query} ${repoQuery} ${type === 'pr' ? 'is:pr' : type === 'issue' ? 'is:issue' : ''}`
        
        result = await octokit.rest.search.issuesAndPullRequests({
          q: finalQuery,
          per_page: 10
        })
        break

      case 'sync-card':
        const { cardId } = params
        const { data: items } = await supabaseClient
          .from('card_github_items')
          .select('*')
          .eq('card_id', cardId)

        const updates = await Promise.all(items.map(async (item) => {
          const [owner, repo] = item.repo_full_name.split('/')
          const { data: latest } = await octokit.rest.issues.get({
            owner,
            repo,
            issue_number: item.item_number
          })
          
          return {
            id: item.id,
            state: latest.pull_request?.merged_at ? 'MERGED' : latest.state.toUpperCase(),
            title: latest.title,
            last_synced_at: new Date().toISOString()
          }
        }))

        for (const update of updates) {
          await supabaseClient.from('card_github_items').update(update).eq('id', update.id)
        }
        result = { success: true, updates }
        break

      default:
        throw new Error('Unsupported action')
    }

    return new Response(JSON.stringify(result.data || result), {
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
