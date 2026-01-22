exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Missing OPENAI_API_KEY" }) };
    }

    const body = JSON.parse(event.body || "{}");
    const { userName = "", target = "", category = "", details = "", length = "medium" } = body;

    const system = `
You compose custom du'a. Return ONLY JSON with keys: arabic, transliteration, english.
Rules:
- arabic must be fully Arabic script (no Latin letters).
- transliteration must be Latin transliteration of the Arabic (no English sentences).
- english must be a natural English translation of the Arabic.
- Do NOT invent hadith citations.
- Incorporate user details meaningfully and respectfully.
- If target is provided, reflect it correctly (e.g., myself, mother, friend).
Length: short=2-3 lines, medium=4-7 lines, long=8-12 lines.
End arabic with آمين and english with Ameen.
`.trim();

    const prompt = `
User name: "${userName}"
Dua for: "${target}"
Category: "${category}"
Details: "${details}"
Length: "${length}"
Return ONLY JSON.
`.trim();

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
      }),
    });

    const raw = await resp.text();
    if (!resp.ok) return { statusCode: resp.status, body: JSON.stringify({ error: raw }) };

    const data = JSON.parse(raw);
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) return { statusCode: 500, body: JSON.stringify({ error: "No content returned." }) };

    let parsed;
    try { parsed = JSON.parse(content); }
    catch { return { statusCode: 500, body: JSON.stringify({ error: "Model did not return valid JSON.", raw: content }) }; }

    const arabic = (parsed.arabic || "").trim();
    const transliteration = (parsed.transliteration || "").trim();
    const english = (parsed.english || "").trim();

    if (!arabic || !transliteration || !english) {
      return { statusCode: 500, body: JSON.stringify({ error: "Missing fields.", parsed }) };
    }
    if (/[A-Za-z]/.test(arabic)) {
      return { statusCode: 500, body: JSON.stringify({ error: "Arabic contains Latin letters.", arabic }) };
    }

    return { statusCode: 200, body: JSON.stringify({ arabic, transliteration, english }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message || "Server error" }) };
  }
};
