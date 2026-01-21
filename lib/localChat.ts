import { formatCitations, searchPassages } from "@/lib/rag";

export type LocalMsg = { role: "user" | "assistant"; content: string };

function threeLangWrap(text: string) {
  // If the assistant doesn't naturally produce 3 sections, we keep it readable.
  return text;
}

function demoAnswer(userText: string, cites: ReturnType<typeof formatCitations>, mode: "study" | "summary" | "quick") {
  const top = cites.slice(0, mode === "quick" ? 2 : 3);

  const intro =
    mode === "summary"
      ? "Here’s a short summary based on the sources I have:"
      : mode === "quick"
      ? "Here’s a quick answer based on the sources I have:"
      : "Here’s a study-friendly answer based on the sources I have:";

  const bullets = top.length
    ? top.map((c) => `- ${c.title}: ${c.snippet} [${c.index}]`).join("\n")
    : "- I couldn’t find a matching passage in the local knowledge base for this question.";

  const guidance =
    "\n\nIf your question is a ruling (fiqh), context matters and it’s best to confirm with a qualified scholar.\n" +
    "If you share your specific scenario, I can help you frame the right question and list what to verify.";

  return threeLangWrap([intro, "", bullets, guidance].join("\n"));
}

export function generateLocalReply(args: {
  messages: LocalMsg[];
  mode: "study" | "summary" | "quick";
}) {
  const lastUser = [...args.messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const retrieved = searchPassages(lastUser, 6);
  const citations = formatCitations(retrieved);
  const answer = demoAnswer(lastUser, citations, args.mode);

  return { answer, citations };
}
