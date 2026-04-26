import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, text, context, userId } = await req.json()

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not set on server' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch User Preferences if userId is provided
    let userPrefs = null;
    if (userId) {
       const supabaseUrl = Deno.env.get('SUPABASE_URL')
       const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
       if (supabaseUrl && supabaseKey) {
          const prefRes = await fetch(`${supabaseUrl}/rest/v1/rpc/get_user_ai_context`, {
             method: 'POST',
             headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
             },
             body: JSON.stringify({ p_user_id: userId })
          });
          const prefData = await prefRes.json();
          userPrefs = prefData?.preferences;
       }
    }

    let prompt = ""
    
    switch (action) {
      case 'IMPROVE':
        prompt = `Improve the following text for clarity, professional tone, and engagement while keeping the original meaning: "${text}"`
        break
      case 'FIX_GRAMMAR':
        prompt = `Fix any spelling and grammar mistakes in the following text: "${text}"`
        break
      case 'PARSE_INTENTION':
        prompt = `
          Analyze the following "Quick Capture" text and extract the task details.
          Current local time: ${new Date().toISOString()}
          Input: "${text}"
          
          Return ONLY a JSON object with:
          - title: (short version of the task)
          - due_date: (ISO string or null)
          - priority: ("HIGH", "MEDIUM", "LOW" or null)
          - category: (one word like "Work", "Personal", "Meeting" or null)
          - is_actionable: (boolean)
          
          Only return the JSON object, no markdown or extra text.
        `
        break
      case 'GENERATE_DAILY_PLAN':
        prompt = `
          You are an expert Productivity AI Agent. 
          Goal: ${userPrefs?.goal || 'BALANCED'}
          Core Hours: ${userPrefs?.schedule?.start || '09:00:00'} to ${userPrefs?.schedule?.end || '17:00:00'}
          
          Generate an optimized daily schedule based on these available tasks and external events.
          Tasks: "${JSON.stringify(context?.tasks)}"
          External Events: "${JSON.stringify(context?.externalEvents)}"
          
          Optimization Strategy:
          - (Goal: PRODUCTIVITY) Focus on high-intensity blocks and Eat the Frog.
          - (Goal: WELLBEING) Ensure 15min breaks every 90min and avoid back-to-back deep work.
          - Use "energy_level" and "focus_score" metadata for placement.
          - Respect Core Hours as the primary working window.
          - Respect existing "externalEvents" as hard constraints.
          
          Return ONLY a JSON array of time blocks:
          [
            { "title": "...", "start_time": "ISO", "end_time": "ISO", "card_id": "UUID or null" }
          ]
        `
        break
      case 'GET_FOCUS_TIPS':
        prompt = `
          You are a Zen-like Focus Agent with a ${userPrefs?.ai_tone || 'PROFESSIONAL'} personality.
          Provide 3-4 concise, highly actionable "Zen Session" tips for a user about to start a deep work focus block.
          Task Title: "${context?.title}"
          Task Context: "${context?.description || 'Deep work'}"
          
          Tone Instructions:
          - PROFESSIONAL: Data-driven, efficient, focused on output.
          - CASUAL: Supportive, friendly, human-centric.
          - ZEN: Minimalist, poetic, focused on breath and stillness.
          - CHALLENGING: High-intensity, disciplined, zero-excuses.
          
          Return ONLY a JSON array of strings.
        `
        break
      default:
        prompt = text
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Gemini API Error', details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const completion = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    return new Response(
      JSON.stringify({ completion }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
