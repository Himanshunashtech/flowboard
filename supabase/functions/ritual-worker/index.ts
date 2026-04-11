import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

/**
 * RITUAL WORKER
 * This function triggers scheduled automations (Daily/Weekly Rituals)
 * across all FlowBoard projects.
 * 
 * Recommended Cron: Every hour (0 * * * *)
 */

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('--- STARTING RITUAL SCAN ---')

    // Call the Postgres RPC function that processes the rituals logic
    const { data: executed, error } = await supabase.rpc('trigger_scheduled_rituals')

    if (error) {
      console.error('Error triggering rituals:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    const report = {
      timestamp: new Date().toISOString(),
      rituals_fired: executed || []
    }

    console.log('--- RITUAL SCAN COMPLETE ---')
    console.log(`Executed Protocols: ${report.rituals_fired.length}`)

    return new Response(JSON.stringify(report), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Fatal Scheduler Error:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
})
