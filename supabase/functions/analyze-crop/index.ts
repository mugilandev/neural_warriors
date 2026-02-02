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
    const { imageBase64, cropType } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert agricultural pathologist and crop disease specialist. Analyze the provided leaf/plant image for diseases, pests, or nutrient deficiencies.

Your response MUST be a valid JSON object with exactly this structure:
{
  "diagnosis": "Name of the disease or condition (e.g., 'Rice Blast (Pyricularia oryzae)' or 'Healthy - No Disease Detected')",
  "confidence": <number between 0-100>,
  "isHealthy": <boolean>,
  "cause": "Detailed explanation of what causes this condition, environmental factors, and how it spreads",
  "organicCure": "Natural and organic treatment methods, including bio-fungicides, cultural practices, and preventive measures",
  "chemicalCure": "Chemical treatment options with specific product names, concentrations, and application instructions",
  "preventionTips": "Best practices to prevent this disease in the future"
}

Guidelines:
- Be specific and accurate in your diagnosis
- If the plant appears healthy, set isHealthy to true and provide general care tips
- Include specific product names and dosages when recommending treatments
- Consider the crop type provided for context-specific recommendations
- Confidence should reflect your certainty based on image quality and visible symptoms`;

    const userMessage = cropType 
      ? `Analyze this ${cropType} plant/leaf image for any diseases, pests, or health issues. Provide detailed diagnosis and treatment recommendations.`
      : `Analyze this plant/leaf image for any diseases, pests, or health issues. Provide detailed diagnosis and treatment recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userMessage },
              {
                type: "image_url",
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI model");
    }

    // Parse the JSON response from the AI
    let analysisResult;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();
      
      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a structured error response
      return new Response(
        JSON.stringify({
          diagnosis: "Analysis Inconclusive",
          confidence: 0,
          isHealthy: false,
          cause: "Unable to analyze the image. Please try with a clearer image of the affected plant part.",
          organicCure: "Consult with a local agricultural extension officer for proper diagnosis.",
          chemicalCure: "Professional diagnosis recommended before chemical treatment.",
          preventionTips: "Ensure good image quality with proper lighting for accurate analysis."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("analyze-crop error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
