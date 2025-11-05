import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userMessage = messages[messages.length - 1]?.content || "";

    // Call Lovable AI for empathetic response
    const chatResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are EchoMind, an empathetic AI emotional co-pilot. Your role is to:
- Listen actively and validate the user's feelings without judgment
- Respond with genuine empathy and warmth
- Help users explore and understand their emotions
- Provide gentle insights and reflections
- Create a safe, supportive space for emotional expression
- Keep responses conversational, warm, and concise (2-3 sentences max)
- Never diagnose or replace professional mental health care
- When appropriate, gently suggest journaling or reflection questions

Tone: Warm, understanding, non-judgmental, supportive, like a caring friend who truly listens.`,
          },
          ...messages,
        ],
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error("AI gateway error:", chatResponse.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const chatData = await chatResponse.json();
    const assistantContent = chatData.choices[0]?.message?.content || "I'm here for you. Could you tell me more?";

    // Analyze emotions using tool calling
    const emotionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You analyze text to detect emotions with their intensity scores (0-1). Return emotions detected.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "detect_emotions",
              description: "Detect emotions in the text with intensity scores",
              parameters: {
                type: "object",
                properties: {
                  emotions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { 
                          type: "string",
                          enum: ["joy", "sadness", "anger", "fear", "anxiety", "optimism", "calm", "stress", "gratitude", "loneliness"]
                        },
                        score: { type: "number", minimum: 0, maximum: 1 },
                      },
                      required: ["label", "score"],
                    },
                  },
                },
                required: ["emotions"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "detect_emotions" } },
      }),
    });

    let emotions = [];
    if (emotionResponse.ok) {
      const emotionData = await emotionResponse.json();
      const toolCall = emotionData.choices[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const args = JSON.parse(toolCall.function.arguments);
        emotions = args.emotions || [];
      }
    }

    console.log("Chat processed successfully", { emotions });

    return new Response(
      JSON.stringify({
        content: assistantContent,
        emotions: emotions,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in chat function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
