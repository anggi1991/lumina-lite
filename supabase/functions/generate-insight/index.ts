import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const AZURE_OPENAI_ENDPOINT = Deno.env.get("AZURE_OPENAI_ENDPOINT");
const AZURE_OPENAI_KEY = Deno.env.get("AZURE_OPENAI_KEY");
const AZURE_OPENAI_DEPLOYMENT = Deno.env.get("AZURE_OPENAI_DEPLOYMENT");
const AZURE_OPENAI_API_VERSION = Deno.env.get("AZURE_OPENAI_API_VERSION");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { mood_level, journal_content, language } = await req.json();

        if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_KEY || !AZURE_OPENAI_DEPLOYMENT) {
            throw new Error("Missing Azure OpenAI configuration");
        }

        const targetLanguage = language === 'en' ? 'English' : 'Bahasa Indonesia';

        const systemPrompt = `Kamu adalah teman yang empatik dan bijaksana (Lumina). 
    Tugasmu adalah memberikan insight singkat dan afirmasi positif berdasarkan mood dan jurnal pengguna.
    Format respons harus JSON: { "insight": "...", "affirmation": "...", "suggested_action": "..." }
    Gunakan ${targetLanguage} yang hangat dan suportif.`;

        const userPrompt = `Mood Level: ${mood_level}/5.
    Journal Content: "${journal_content || 'Tidak ada catatan jurnal.'}"`;

        const url = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": AZURE_OPENAI_KEY,
            },
            body: JSON.stringify({
                messages: [
                    { role: "user", content: systemPrompt + "\n\n" + userPrompt }, // Merged system into user for compatibility
                ],
                max_completion_tokens: 2000,
            }),
        });

        const data = await response.json();
        // console.log("Azure Response:", JSON.stringify(data)); // Log full response

        if (data.error) {
            throw new Error(data.error.message);
        }

        const aiContent = data.choices[0].message.content;

        // Try to parse JSON from AI response (it might be wrapped in markdown code blocks)
        let parsedContent;
        try {
            const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedContent = JSON.parse(jsonMatch[0]);
            } else {
                parsedContent = {
                    insight: aiContent || "No content from AI",
                    affirmation: "Tetap semangat!",
                    suggested_action: "Bernapaslah sejenak.",
                };
            }
        } catch (error) {
            console.error("Failed to parse AI response:", error);
            parsedContent = {
                insight: aiContent || "No content from AI",
                affirmation: "Tetap semangat!",
                suggested_action: "Bernapaslah sejenak.",
            };
        }

        return new Response(JSON.stringify(parsedContent), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error in generate-insight:", error); // Add logging
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
