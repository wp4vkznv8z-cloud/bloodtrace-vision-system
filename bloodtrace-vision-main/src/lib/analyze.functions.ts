import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ALLOWED = ["passive", "spatter", "altered"] as const;

const inputSchema = z.object({
  imageDataUrl: z.string().min(20).max(15_000_000),
});

const analysisSchema = z.object({
  category: z.enum(ALLOWED),
  confidence: z.number().min(0).max(100),
  observations: z.array(z.string().min(1).max(400)).min(2).max(8),
  interpretation: z.string().min(20).max(1200),
});

export type AnalysisResult = z.infer<typeof analysisSchema>;

export const analyzeBloodImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a forensic vision assistant providing PRELIMINARY observations on bloodstain imagery for educational and investigative support. You are NOT a certified forensic analyst. Be cautious, objective, and avoid speculation about persons or crimes. Classify the dominant bloodstain pattern in the image into exactly one of:
- "passive": drops, pools, or flows produced by gravity alone
- "spatter": impact, projected, or expirated patterns from applied force
- "altered": wiped, smeared, diluted, or otherwise manipulated stains

Return STRICT JSON only via the provided tool. Confidence is 0-100. Provide 3-6 short objective observations and a brief possible-scene interpretation (no naming of persons, no crime conclusions).`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              { type: "text", text: "Analyze the bloodstain pattern in this image and return the structured forensic classification." },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_bloodstain",
              description: "Return structured preliminary bloodstain analysis.",
              parameters: {
                type: "object",
                properties: {
                  category: { type: "string", enum: ["passive", "spatter", "altered"] },
                  confidence: { type: "number", minimum: 0, maximum: 100 },
                  observations: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 2,
                    maxItems: 8,
                  },
                  interpretation: { type: "string" },
                },
                required: ["category", "confidence", "observations", "interpretation"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_bloodstain" } },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Rate limit reached. Please try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
      throw new Error(`AI gateway error ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const call = json?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) {
      throw new Error("AI returned no structured analysis.");
    }
    const parsed = analysisSchema.parse(JSON.parse(call.function.arguments));
    return parsed;
  });
