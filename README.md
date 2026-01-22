# Islam AI — AI-Powered Islamic Study & Duʿā Assistant

**Islam AI** is a full-stack, citations-first Islamic study web application built as a **portfolio project** to demonstrate modern frontend architecture, retrieval-augmented generation (RAG), and serverless AI integration.

The project emphasizes **accuracy, transparency, and respectful handling of religious content**.

---

## ✨ Key Features

### 🧠 AI Study Assistant
- Chat interface with **Study / Summary / Quick** modes
- Answers grounded in sources with **explicit citation markers** (e.g. `[1]`)
- Clear disclaimer for scholarly rulings (not a fatwa service)
- Saved chat history (browser localStorage)
- Export conversations to **Markdown**

### 📚 Retrieval-Augmented Generation (RAG)
- Local knowledge base (`data/knowledge.json`)
- TF-IDF style retrieval running fully client-side
- Sources panel showing matched passages
- Designed to reduce hallucinations and improve trust

### 🤲 AI-Generated Custom Duʿā
- User-specified duʿā intent (e.g. forgiveness, guidance, exams)
- Optional personal details
- **Correctly generated output in:**
  - Arabic (proper Arabic, not transliterated English)
  - Transliteration
  - English translation
- Duʿā generation handled **server-side** for correctness and security

### 🎨 UI / UX
- Responsive, modern interface (Tailwind CSS)
- Light / Dark mode toggle
- Clean layout optimized for readability and calm interaction

---

## 🏗️ Architecture Overview

**Frontend**
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Static export (`output: "export"`)

**Backend**
- Netlify Functions (serverless)
- OpenAI API (optional, secure)
- API keys never exposed to the client

**Data**
- Local JSON knowledge base for RAG
- Browser localStorage for chat persistence

---

## 🚀 Getting Started (Local)

```bash
npm install
npm run dev
Open:
http://localhost:3000

Note: Netlify Functions run only in production unless you use the Netlify CLI.

🔐 Enabling AI Features (Optional)
To enable AI-powered chat and duʿā generation, add environment variables in Netlify:

OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
The app gracefully degrades if no API key is provided.

📁 Knowledge Base Customization
Edit or extend:
data/knowledge.json
You can add:
Qurʾān passages
Hadith excerpts
Scholarly articles
Personal study notes

Each entry can include:
Title
Snippet
Source link
```

🧪 Design Decisions & Tradeoffs
Arabic generation is server-side only to prevent incorrect language output
RAG is kept local for transparency and debuggability
Serverless backend chosen for simplicity and security
UI prioritizes clarity over feature overload

📌 Future Improvements
Embeddings-based retrieval
User accounts & saved profiles
Topic explorer (Aqeedah, Seerah, Fiqh, Akhlaq)
Evaluation metrics for answer faithfulness
Multi-language UI support

⚠️ Disclaimer
Islam AI is a learning and organizational tool.
It is not a substitute for qualified scholars or formal religious verdicts (fatwa).

👤 Author
Saim Khalid
Software Engineering (Portfolio Project)
