export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing OPENAI_API_KEY" }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const messages = body.messages || [];
    const citations = body.citations || [];

    const systemPrompt = `
You are Islam AI, a respectful Islamic study assistant.
- Do not give definitive fatwa.
- Encourage consulting qualified scholars when rulings are required.
- Only answer using provided sources.
- Add citation markers like [1], [2].
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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        temperature: 0.4,
      }),
    });

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "";

    return {
      statusCode: 200,
      body: JSON.stringify({ answer }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
