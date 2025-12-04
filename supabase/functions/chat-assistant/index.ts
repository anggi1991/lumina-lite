import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const AZURE_OPENAI_ENDPOINT = Deno.env.get("AZURE_OPENAI_ENDPOINT");
const AZURE_OPENAI_KEY = Deno.env.get("AZURE_OPENAI_KEY");
const AZURE_OPENAI_DEPLOYMENT = Deno.env.get("AZURE_OPENAI_DEPLOYMENT");
const AZURE_OPENAI_API_VERSION = Deno.env.get("AZURE_OPENAI_API_VERSION");

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { message, history, language } = await req.json();

        if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_KEY || !AZURE_OPENAI_DEPLOYMENT) {
            throw new Error("Missing Azure OpenAI configuration");
        }

        // 1. System Prompt & Persona
        // Dynamic language instruction: "Respond in the language specified: ${language}"
        const systemPrompt = `
You are Lumi, a warm, empathetic, and supportive AI Journal Assistant.
Your goal is to provide emotional support, listen to the user, and offer gentle guidance.

**Persona Rules:**
- Name: Lumi.
- Tone: Friendly, calm, non-judgmental, and human-like.
- Language: You MUST respond in the language specified by the user: ${language || 'English'}.
- Length: Keep responses concise (2-4 sentences) unless the user asks for a detailed explanation. Avoid long lectures.

**Safety Guardrails (CRITICAL):**
- If the user mentions self-harm, suicide, or severe mental health crisis:
  - DO NOT try to treat them.
  - Respond with immediate empathy and suggest professional help (in the target language).
  - Example: "I hear that you're in a lot of pain right now, and I'm concerned about you. Please reach out to a professional or a trusted person who can support you safely. You are not alone."
- Do not provide medical diagnoses.

**Context:**
- You are chatting with a user of the "Lumina" app (AI Journal & Mood Tracker).
- Use the provided conversation history to maintain context.
`;

        // 2. Prepare Messages for Azure OpenAI
        const messages = [
            { role: 'system', content: systemPrompt },
            ...(history || []).slice(-10), // Keep last 10 messages for context window
            { role: 'user', content: message }
        ];

        // 3. Call Azure OpenAI API
        const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': AZURE_OPENAI_KEY,
            },
            body: JSON.stringify({
                messages: messages,
                max_completion_tokens: 300,
            }),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const reply = data.choices[0].message.content;

        return new Response(
            JSON.stringify({ reply }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );

    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
    }
});
