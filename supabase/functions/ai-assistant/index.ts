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
    const { action, text, context } = await req.json()

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not set on server' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let prompt = ""
    
    switch (action) {
      case 'IMPROVE':
        prompt = `Improve the following text for clarity, professional tone, and engagement while keeping the original meaning: "${text}"`
        break
      case 'FIX_GRAMMAR':
        prompt = `Fix any spelling and grammar mistakes in the following text: "${text}"`
        break
      case 'LENGTHEN':
        prompt = `Expand on the following text to make it more detailed and comprehensive: "${text}"`
        break
      case 'SHORTEN':
        prompt = `Make the following text more concise and direct while keeping the key information: "${text}"`
        break
      case 'SUMMARIZE':
        prompt = `Summarize the following text into a few key bullet points: "${text}"`
        break
      case 'GENERATE_SUBTASKS':
        prompt = `Based on the following card title and description, generate a JSON array of subtask titles. Only return the JSON array of strings, nothing else. Title: "${context?.title}", Description: "${text}"`
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
