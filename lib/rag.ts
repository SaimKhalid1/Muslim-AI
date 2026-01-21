import knowledge from "@/data/knowledge.json";

export type Passage = {
  id: string;
  sourceTitle: string;
  sourceUrl?: string;
  sourceType: "quran" | "hadith" | "scholar" | "article" | "note";
  text: string;
};

type Index = {
  passages: Passage[];
  vocab: Map<string, number>;
  idf: Float32Array;
  vectors: Float32Array[]; // tf-idf vectors
  norms: Float32Array;
};

const STOP = new Set([
  "the","a","an","and","or","but","if","then","so","to","of","in","on","for","with","as","at","by","from","is","are","was","were","be","been","being",
  "it","this","that","these","those","you","your","yours","we","our","ours","they","their","theirs","i","me","my","mine","he","she","him","her","his","hers",
  "not","no","yes","do","does","did","doing","can","could","should","would","will","just","about","into","over","under","more","most","some","such"
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s’']/g, " ")
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length >= 2 && !STOP.has(t));
}

let INDEX: Index | null = null;

function buildIndex(): Index {
  const passages = (knowledge.passages ?? []) as Passage[];
  const docsTokens = passages.map(p => tokenize(p.text));
  const vocab = new Map<string, number>();
  for (const toks of docsTokens) {
    for (const t of toks) if (!vocab.has(t)) vocab.set(t, vocab.size);
  }

  const df = new Int32Array(vocab.size);
  for (const toks of docsTokens) {
    const seen = new Set<number>();
    for (const t of toks) {
      const idx = vocab.get(t);
      if (idx === undefined) continue;
      seen.add(idx);
    }
    for (const idx of seen) df[idx] += 1;
  }

  const N = passages.length || 1;
  const idf = new Float32Array(vocab.size);
  for (let i = 0; i < vocab.size; i++) {
    // smooth
    idf[i] = Math.log((N + 1) / (df[i] + 1)) + 1;
  }

  const vectors: Float32Array[] = [];
  const norms = new Float32Array(passages.length);

  for (let di = 0; di < passages.length; di++) {
    const toks = docsTokens[di];
    const tf = new Float32Array(vocab.size);
    for (const t of toks) {
      const idx = vocab.get(t);
      if (idx !== undefined) tf[idx] += 1;
    }
    // normalize tf
    let max = 0;
    for (let i = 0; i < tf.length; i++) if (tf[i] > max) max = tf[i];
    if (max > 0) for (let i = 0; i < tf.length; i++) tf[i] = tf[i] / max;

    const vec = new Float32Array(vocab.size);
    let sumSq = 0;
    for (let i = 0; i < vec.length; i++) {
      vec[i] = tf[i] * idf[i];
      sumSq += vec[i] * vec[i];
    }
    norms[di] = Math.sqrt(sumSq) || 1;
    vectors.push(vec);
  }

  return { passages, vocab, idf, vectors, norms };
}

function ensureIndex(): Index {
  if (!INDEX) INDEX = buildIndex();
  return INDEX;
}

function cosine(a: Float32Array, b: Float32Array, bNorm: number): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  const aNorm = Math.sqrt(a.reduce((s, x) => s + x*x, 0)) || 1;
  return dot / (aNorm * bNorm);
}

export function searchPassages(query: string, k = 5): { passage: Passage; score: number }[] {
  const idx = ensureIndex();
  const toks = tokenize(query);
  const qtf = new Float32Array(idx.vocab.size);
  for (const t of toks) {
    const vi = idx.vocab.get(t);
    if (vi !== undefined) qtf[vi] += 1;
  }
  let qMax = 0;
  for (let i = 0; i < qtf.length; i++) if (qtf[i] > qMax) qMax = qtf[i];
  if (qMax > 0) for (let i = 0; i < qtf.length; i++) qtf[i] = qtf[i] / qMax;

  const qVec = new Float32Array(idx.vocab.size);
  for (let i = 0; i < qVec.length; i++) qVec[i] = qtf[i] * idx.idf[i];

  const scored = idx.passages.map((p, i) => ({
    passage: p,
    score: cosine(qVec, idx.vectors[i], idx.norms[i]),
  }));

  scored.sort((a,b) => b.score - a.score);
  return scored.filter(x => x.score > 0.05).slice(0, k);
}

export function formatCitations(results: { passage: Passage; score: number }[]) {
  return results.map((r, i) => ({
    id: r.passage.id,
    index: i + 1,
    title: r.passage.sourceTitle,
    url: r.passage.sourceUrl,
    type: r.passage.sourceType,
    snippet: r.passage.text.length > 240 ? r.passage.text.slice(0, 240) + "…" : r.passage.text,
  }));
}
