function getApiKey() {
  return localStorage.getItem("finapp_apikey") || import.meta.env.VITE_OPENROUTER_API_KEY || "";
}

export async function callOpenRouter(messages, model, maxTokens = 1000, systemPrompt = null) {
  const fullMessages = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...messages]
    : messages;
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getApiKey()}`,
      "HTTP-Referer": "https://github.com/werbraz/FinanceApp",
      "X-Title": "FINFLOW",
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: fullMessages }),
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
