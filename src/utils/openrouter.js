const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export async function callOpenRouter(messages, model, maxTokens = 1000) {
  const res = await fetch("/api/openrouter/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "FINFLOW",
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export function toImageMsg(base64, mimeType, prompt) {
  return {
    role: "user",
    content: [
      { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
      { type: "text", text: prompt },
    ],
  };
}
