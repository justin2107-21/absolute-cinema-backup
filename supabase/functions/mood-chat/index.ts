import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MOOD_SYSTEM_PROMPT = `You are MoodMatch AI, a compassionate and emotionally intelligent movie recommendation assistant for CinemaSync. 

PERSONALITY:
- Warm, understanding, and genuinely caring
- Never robotic or clinical
- Validates emotions before offering suggestions
- Uses natural, conversational language

RESPONSE STRUCTURE:
1. ALWAYS start by acknowledging and validating the user's feelings in 1-2 sentences
2. Show genuine empathy and understanding
3. End with a hopeful transition to movie recommendations

MOOD DETECTION:
Analyze the user's message for these moods:
- happy, joyful → warm, uplifting tone
- sad, down, upset → gentle, comforting tone
- stressed, anxious, overwhelmed → calming, soothing tone
- romantic, loving → warm, dreamy tone
- excited, energetic → enthusiastic tone
- relaxed, calm → peaceful tone
- lonely → warm, inclusive tone
- burned_out → understanding, gentle tone
- nostalgic → reflective, warm tone
- heartbroken → deeply compassionate tone
- motivated → encouraging tone
- bored → engaging, curious tone
- hopeful → optimistic tone
- curious → inquisitive, excited tone

EXAMPLES:
User: "I'm feeling really stressed from work"
Response: "I completely understand – work stress can feel so heavy, and it's exhausting carrying that weight. It makes total sense that you'd want something to help you unwind and escape for a bit. Let me find some movies that will help you breathe and relax."

User: "I want comedy Filipino movies"
Response: "Oh, great choice! Filipino comedies have such a unique warmth and humor that's just infectious. Whether you're craving some classic laughs or discovering new favorites, I've got some gems lined up for you."

Always respond in 2-3 sentences maximum. Be genuine, not generic.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const messages = [
      { role: "system", content: MOOD_SYSTEM_PROMPT },
      ...(conversationHistory || []),
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        tools: [
          {
            type: "function",
            function: {
              name: "detect_mood_and_preferences",
              description: "Detect user's mood and movie preferences from their message",
              parameters: {
                type: "object",
                properties: {
                  mood: {
                    type: "string",
                    enum: ["happy", "sad", "stressed", "romantic", "excited", "relaxed", "lonely", "anxious", "burned_out", "overwhelmed", "nostalgic", "heartbroken", "motivated", "bored", "hopeful", "curious"],
                    description: "The detected mood of the user"
                  },
                  genres: {
                    type: "array",
                    items: { type: "string" },
                    description: "Preferred movie genres mentioned or inferred"
                  },
                  language: {
                    type: "string",
                    description: "Preferred language if mentioned (e.g., 'filipino', 'korean', 'japanese')"
                  },
                  keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key themes or preferences mentioned"
                  }
                },
                required: ["mood"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: "auto"
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const choice = data.choices[0];
    
    let aiMessage = choice.message.content || "";
    let moodData = null;

    // Check for tool calls
    if (choice.message.tool_calls) {
      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.function.name === "detect_mood_and_preferences") {
          try {
            moodData = JSON.parse(toolCall.function.arguments);
          } catch (e) {
            console.error("Failed to parse mood data:", e);
          }
        }
      }
    }

    // If we got tool calls but no content, make another call for the empathetic response
    if (!aiMessage && moodData) {
      const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: MOOD_SYSTEM_PROMPT },
            { role: "user", content: message },
            { role: "assistant", content: `I detected the user is feeling ${moodData.mood}. Generate an empathetic response.` }
          ]
        }),
      });

      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json();
        aiMessage = followUpData.choices[0]?.message?.content || getDefaultEmpathyResponse(moodData.mood);
      }
    }

    // Fallback if still no message
    if (!aiMessage) {
      aiMessage = getDefaultEmpathyResponse(moodData?.mood || "happy");
    }

    return new Response(JSON.stringify({ 
      message: aiMessage,
      mood: moodData?.mood || inferMoodFromMessage(message),
      preferences: moodData
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Mood chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getDefaultEmpathyResponse(mood: string): string {
  const responses: Record<string, string> = {
    happy: "That's wonderful to hear! Your positive energy is contagious, and I'd love to keep that vibe going with some feel-good movies.",
    sad: "I hear you, and it's okay to feel this way. Sometimes we need movies that understand us, or ones that gently lift our spirits.",
    stressed: "I completely understand – stress can be so overwhelming. Let me find something that'll help you decompress and escape for a while.",
    romantic: "Ah, love is in the air! Whether you want swooning romance or heartwarming stories, I've got you covered.",
    excited: "I love your energy! Let's channel that excitement into some thrilling, edge-of-your-seat entertainment.",
    relaxed: "Sounds like the perfect mood for some cozy viewing. Let me find something that matches your peaceful vibe.",
    lonely: "I'm here with you, and movies have a beautiful way of making us feel less alone. Let's find some stories with warmth and connection.",
    anxious: "Take a deep breath – I understand how anxiety can grip you. Let me suggest some calming, gentle films to help ease your mind.",
    burned_out: "Burnout is real and exhausting. You deserve something comforting that doesn't demand too much from you right now.",
    overwhelmed: "That's a lot to carry. Let me find something light and easy that'll give your mind a much-needed break.",
    nostalgic: "There's something beautiful about looking back. Let me find movies that capture that warm, nostalgic feeling.",
    heartbroken: "I'm so sorry you're going through this. Whether you need a good cry or something to lift your spirits, I'm here for you.",
    motivated: "I love that drive! Let me find some inspiring stories that'll fuel your momentum.",
    bored: "Let's shake things up! I'll find something unexpected and engaging to spark your interest.",
    hopeful: "That optimism is beautiful. Let me match it with some uplifting stories that celebrate hope.",
    curious: "I love your sense of wonder! Let me find some thought-provoking films that'll satisfy that curiosity."
  };
  return responses[mood] || responses.happy;
}

function inferMoodFromMessage(message: string): string {
  const lower = message.toLowerCase();
  if (lower.match(/sad|down|upset|cry|depressed/)) return "sad";
  if (lower.match(/stress|anxious|worried|overwhelm/)) return "stressed";
  if (lower.match(/love|romantic|date|relationship/)) return "romantic";
  if (lower.match(/excit|thrill|adventure|action/)) return "excited";
  if (lower.match(/relax|calm|peace|chill/)) return "relaxed";
  if (lower.match(/lonely|alone|isolated/)) return "lonely";
  if (lower.match(/burned|exhausted|tired/)) return "burned_out";
  if (lower.match(/nostalg|remember|childhood|old/)) return "nostalgic";
  if (lower.match(/heartbr|breakup|ex\b/)) return "heartbroken";
  if (lower.match(/motiv|inspir|productive/)) return "motivated";
  if (lower.match(/bored|nothing to do/)) return "bored";
  if (lower.match(/hope|optimis|positive/)) return "hopeful";
  if (lower.match(/curious|wonder|learn/)) return "curious";
  return "happy";
}