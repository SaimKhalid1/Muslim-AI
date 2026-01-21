exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing OPENAI_API_KEY (Netlify env var not set)." }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const messages = body.messages || [];
    const citations = body.citations || [];

    const systemPrompt = `
You are Islam AI, a respectful Islamic study assistant.
- Do NOT give definitive fatwa. Encourage consulting qualified scholars for rulings.
- If sources are insufficient, say what you can generally and suggest what to verify.
- Keep the tone calm, kind, and clear.
- Add citation markers like [1], [2] when sources are provided.
`.trim();

    const sourcesText = citations.length
      ? citations.map(c =>
          `[${c.index}] ${c.title}${c.url ? " — " + c.url : ""}\n${c.snippet}`
        ).join("\n\n")
      : "No sources provided.";

    const openaiMessages = [
      { role: "system", content: systemPrompt + "\n\nSources:\n" + sourcesText },
      ...messages,
    ];

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        temperature: 0.4,
      }),
    });

    const rawText = await resp.text();

    // If OpenAI failed, return the real error to the frontend
    if (!resp.ok) {
      return {
        statusCode: resp.status,
        body: JSON.stringify({ error: rawText }),
      };
    }

    const data = JSON.parse(rawText);
    const answer = data?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "OpenAI returned no answer (no choices/message). Raw: " + rawText.slice(0, 500),
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ answer }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message || "Server error" }) };
  }
};

