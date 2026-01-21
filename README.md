# Islam AI (Portfolio Web App)

A citations-first Islamic study assistant built with **Next.js + TypeScript + Tailwind**.

## Features
- Chat UI with **Study / Summary / Quick** modes
- **Local RAG** (search over `data/knowledge.json`) with a Sources panel + links
- Answers include citation markers like `[1]`
- **Saved chats** in browser localStorage + **Export to Markdown**
- **Demo mode** works without any API key
- Optional OpenAI integration (`OPENAI_API_KEY`) for higher quality answers

## Quick start
```bash
npm install
npm run dev
```
Open: http://localhost:3000

## Optional: enable OpenAI
Create `.env.local`:
```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

## Customize the knowledge base
Edit:
- `data/knowledge.json`

Add more passages (Qur’an/hadith/scholar articles/your own notes). The retrieval is TF‑IDF based and runs locally.

## Portfolio tips (make it stand out)
- Add 200–500 high-quality passages with reliable references.
- Add a “topic explorer” page, bookmarks, and per-source filtering.
- Add an evaluation script (question set + expected citations) and show metrics.
