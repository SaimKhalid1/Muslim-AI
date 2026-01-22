"use client";

import { useMemo, useState } from "react";
import { Button } from "./Button";
import { Badge } from "./Badge";

type Category = {
  id: string;
  label: string;
  colorClass: string;
  icon: string;
};

const CATEGORIES: Category[] = [
  { id: "forgive", label: "Forgiveness", colorClass: "spiritual-border", icon: "🤍" },
  { id: "guidance", label: "Guidance", colorClass: "spiritual-border-emerald", icon: "🧭" },
  { id: "anxiety", label: "Anxiety", colorClass: "spiritual-border-sky", icon: "🌊" },
  { id: "exam", label: "Exams/Work", colorClass: "spiritual-border-rose", icon: "📚" },
  { id: "health", label: "Health", colorClass: "spiritual-border-emerald", icon: "🌿" },
  { id: "family", label: "Family", colorClass: "spiritual-border", icon: "🤲" }
];

type Dua = {
  arabic: string;
  transliteration: string;
  english: string;
};

function norm(s: string) {
  return (s || "").trim().toLowerCase();
}

// Best-effort Arabic script rendering for user-entered names/details.
// (Static export friendly: no external APIs.)
function translitToArabic(input: string) {
  const s = (input || "").trim();
  if (!s) return "";
  // If it already contains Arabic letters, keep it.
  if (/[\u0600-\u06FF]/.test(s)) return s;

  // Basic letter mapping (good enough for names / short phrases).
  const map: Record<string, string> = {
    a: "ا", b: "ب", c: "ك", d: "د", e: "ي", f: "ف", g: "ج", h: "ه", i: "ي", j: "ج", k: "ك", l: "ل",
    m: "م", n: "ن", o: "و", p: "ب", q: "ق", r: "ر", s: "س", t: "ت", u: "و", v: "ف", w: "و", x: "كس", y: "ي", z: "ز",
    " ": " ", "-": "-"
  };

  let out = "";
  const lower = s.toLowerCase();
  for (let i = 0; i < lower.length; i++) {
    const ch = lower[i];
    out += map[ch] ?? "";
  }
  return out || s;
}

// Very small Arabic->Latin transliteration (best-effort).
// Goal: avoid mixing raw English inside the transliteration block.
function arabicToLatin(input: string) {
  const s = (input || "").trim();
  if (!s) return "";
  const map: Record<string, string> = {
    "ا": "a", "أ": "a", "إ": "i", "آ": "aa",
    "ب": "b", "ت": "t", "ث": "th", "ج": "j", "ح": "h", "خ": "kh",
    "د": "d", "ذ": "dh", "ر": "r", "ز": "z", "س": "s", "ش": "sh",
    "ص": "s", "ض": "d", "ط": "t", "ظ": "z", "ع": "'", "غ": "gh",
    "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m", "ن": "n",
    "ه": "h", "و": "w", "ي": "y", "ى": "a", "ة": "h",
    "ء": "'",
    "ً": "", "ٌ": "", "ٍ": "", "َ": "", "ُ": "", "ِ": "", "ّ": "", "ْ": "",
    "\n": "\n", " ": " ", "-": "-", "(": "(", ")": ")", ".": ".", ",": ","
  };

  let out = "";
  for (const ch of s) out += map[ch] ?? "";
  // Clean up repeated apostrophes/spaces.
  out = out.replace(/\s+/g, " ").replace(/'+/g, "'").trim();
  return out;
}

function cleanWhoForEnglish(whoFor: string) {
  let w = (whoFor || "").trim();
  if (!w) return "";
  w = w.replace(/^for\s+/i, "");
  w = w.replace(/^my\s+/i, "");
  w = w.replace(/^the\s+/i, "");
  return w.trim();
}

function arabicizeWhoFor(whoFor: string) {
  const w = norm(whoFor);
  if (!w) return "";
  const table: Record<string, string> = {
    "my mother": "أُمِّي",
    "mother": "أُمِّي",
    "mom": "أُمِّي",
    "my mom": "أُمِّي",
    "my father": "أَبِي",
    "father": "أَبِي",
    "dad": "أَبِي",
    "my dad": "أَبِي",
    "my parents": "وَالِدَيَّ",
    "parents": "وَالِدَيَّ",
    "my friend": "صَدِيقِي",
    "friend": "صَدِيقِي",
    "my brother": "أَخِي",
    "brother": "أَخِي",
    "my sister": "أُخْتِي",
    "sister": "أُخْتِي",
    "my wife": "زَوْجَتِي",
    "wife": "زَوْجَتِي",
    "my husband": "زَوْجِي",
    "husband": "زَوْجِي",
    "my son": "ابْنِي",
    "son": "ابْنِي",
    "my daughter": "ابْنَتِي",
    "daughter": "ابْنَتِي"
  };
  return table[w] ?? translitToArabic(whoFor);
}

function arabicizeDetails(details: string) {
  const d = norm(details);
  if (!d) return "";

  // Heuristic phrase handling (keeps Arabic meaningful for common student/work cases).
  if (d.includes("exam") || d.includes("exams") || d.includes("final")) {
    if (d.includes("prepare") || d.includes("preparing") || d.includes("prep") || d.includes("ready")) {
      if (d.includes("important") || d.includes("very")) {
        return "الِاسْتِعْدَادُ لِلِامْتِحَانَاتِ النِّهَائِيَّةِ الْمُهِمَّةِ جِدًّا";
      }
      return "الِاسْتِعْدَادُ لِلِامْتِحَانَاتِ النِّهَائِيَّة";
    }
    if (d.includes("study") || d.includes("studying")) {
      return "الدِّرَاسَةُ لِلِامْتِحَانَاتِ النِّهَائِيَّة";
    }
    // Generic fallback for exam-related details.
    return "أَمْرُ الْامْتِحَانَاتِ";
  }
  const table: Record<string, string> = {
    "studying for exam": "دِرَاسَتِي لِلِامْتِحَان",
    "studying for exams": "دِرَاسَتِي لِلِامْتِحَانَات",
    "exam": "الامْتِحَان",
    "exams": "الامْتِحَانَات",
    "work": "الْعَمَل",
    "job": "الْعَمَل",
    "anxiety": "الْقَلَق",
    "stress": "التَّوَتُّر",
    "health": "الصِّحَّة",
    "family": "أَهْلِي",
    "for my family": "أَهْلِي",
    "for my mother": "أُمِّي",
    "for my father": "أَبِي"
  };
  return table[d] ?? translitToArabic(details);
}

function buildDua(params: {
  name: string;
  whoFor: string;
  details: string;
  categoryId: string;
}): Dua {
  const name = (params.name || "").trim();
  const whoFor = (params.whoFor || "").trim();
  const details = (params.details || "").trim();

  const category = CATEGORIES.find(c => c.id === params.categoryId)?.label || "Guidance";
  const whoForAr = arabicizeWhoFor(whoFor);
  const whoForEnClean = whoFor ? cleanWhoForEnglish(whoFor) : "";
  // In English/transliteration, don't echo possessives like "my mother"—use "mother".
  const whoPhraseEn = whoForEnClean ? ` for ${whoForEnClean}` : "";
  const whoPhraseAr = whoForAr ? ` لِ${whoForAr}` : "";

  // Core phrases (short + safe)
  const openingAr = "ٱللَّهُمَّ";
  const openingTr = "Allāhumma";
  const openingEn = "O Allah,";

  // Category intents (simple, not a fatwa)
  const intents: Record<string, Dua> = {
    forgive: {
      arabic: "ٱغْفِرْ لِي وَٱرْحَمْنِي وَتُبْ عَلَيَّ",
      transliteration: "ighfir lī warḥamnī watub 'alayya",
      english: "forgive me, have mercy on me, and accept my repentance"
    },
    guidance: {
      arabic: "ٱهْدِنِي وَٱثَبِّتْ قَلْبِي عَلَى دِينِكَ",
      transliteration: "ihdinī wathabbit qalbī 'alā dīnik",
      english: "guide me and keep my heart firm upon Your religion"
    },
    anxiety: {
      arabic: "ٱشْرَحْ لِي صَدْرِي وَٱطْمَئِنَّ قَلْبِي",
      transliteration: "ishraḥ lī ṣadrī waṭma'inna qalbī",
      english: "expand my chest and grant my heart tranquility"
    },
    exam: {
      arabic: "ٱفْتَحْ لِي أَبْوَابَ ٱلْفَهْمِ وَٱلْحِكْمَةِ",
      transliteration: "iftaḥ lī abwāba al-fahmi wal-ḥikmah",
      english: "open for me the doors of understanding and wisdom"
    },
    health: {
      arabic: "ٱشْفِنِي شِفَاءً لَا يُغَادِرُ سَقَمًا",
      transliteration: "ishfinī shifā'an lā yughādiru saqaman",
      english: "grant me a cure that leaves no illness"
    },
    family: {
      arabic: "أَصْلِحْ لِي أَهْلِي وَٱجْمَعْنَا عَلَى ٱلْخَيْرِ",
      transliteration: "aṣliḥ lī ahlī wajma'nā 'alā al-khayr",
      english: "rectify my family and unite us upon goodness"
    }
  };

  const intent = intents[params.categoryId] || intents.guidance;

  const nameAr = name ? translitToArabic(name) : "";

  const personalLineAr = nameAr
    ? `وَٱجْعَلْنِي مِنْ عِبَادِكَ ٱلصَّالِحِينَ (${nameAr})`
    : "وَٱجْعَلْنِي مِنْ عِبَادِكَ ٱلصَّالِحِينَ";

  const personalLineTr = name
    ? `waj'alnī min 'ibādika aṣ-ṣāliḥīn (${name})`
    : "waj'alnī min 'ibādika aṣ-ṣāliḥīn";

  const personalLineEn = name
    ? `and make me among Your righteous servants (${name})`
    : "and make me among Your righteous servants";

  // Embed details *inside* the dua (and keep language-consistent).
  const detailsAr = arabicizeDetails(details);
  const detailsTr = detailsAr ? arabicToLatin(detailsAr) : "";
  const detailsLineAr = detailsAr ? `\nوَيَسِّرْ لِي ${detailsAr}.` : "";
  // Transliteration block should not contain raw English; use best-effort transliteration.
  const detailsLineTr = detailsTr ? `\nwayassir lī ${detailsTr}.` : "";
  const detailsLineEn = details ? `\nAnd make easy for me: ${details}.` : "";

  return {
    arabic:
      `${openingAr} يَا رَبَّ، ${intent.arabic}${whoPhraseAr}.\n${personalLineAr}.${detailsLineAr}\n\nآمِين`,
    transliteration:
      `${openingTr} yā Rabb, ${intent.transliteration}${whoPhraseEn}.\n${personalLineTr}.${detailsLineTr}\n\nĀmīn`,
    english:
      `${openingEn} my Lord, ${intent.english}${whoPhraseEn}.\n${personalLineEn}.${detailsLineEn}\n\nAmeen`
  };
}

export function DuaBuilder() {
  const [categoryId, setCategoryId] = useState<string>("guidance");
  const [name, setName] = useState("");
  const [whoFor, setWhoFor] = useState("");
  const [details, setDetails] = useState("");
  const [dua, setDua] = useState<Dua | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedLabel = useMemo(() => CATEGORIES.find(c => c.id === categoryId)?.label || "Guidance", [categoryId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-extrabold tracking-tight">Dua Builder</div>
        <Badge>{selectedLabel}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {CATEGORIES.map(c => {
          const selected = c.id === categoryId;
          return (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={
                "rounded-2xl p-3 text-left transition border bg-[rgba(var(--card),1)] " +
                (selected
                  ? `ring-2 ring-[rgba(var(--gold),0.65)] shadow-soft ${c.colorClass} bg-[linear-gradient(135deg,rgba(var(--gold),0.10),rgba(var(--emerald),0.08),rgba(var(--gold2),0.10))]`
                  : `hover:bg-[rgba(var(--card2),1)] border-[rgba(var(--border),1)]`)
              }
            >
              <div className="flex items-center gap-2">
                <div className="text-lg">{c.icon}</div>
                <div className="font-bold">{c.label}</div>
              </div>
              <div className="mt-1 text-xs text-[rgb(var(--muted))]">Tap to select</div>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl p-4 bg-[rgba(var(--card2),0.75)] spiritual-border-emerald space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[rgb(var(--muted))]">Your name (optional)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Saim"
              className="mt-1 w-full rounded-xl border border-[rgba(var(--border),1)] bg-[rgba(var(--card),1)] p-3 text-sm outline-none focus:ring-2 focus:ring-[rgba(var(--emerald),0.35)]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[rgb(var(--muted))]">Who is this dua for? (optional)</label>
            <input
              value={whoFor}
              onChange={(e) => setWhoFor(e.target.value)}
              placeholder="e.g., my mother / my friend"
              className="mt-1 w-full rounded-xl border border-[rgba(var(--border),1)] bg-[rgba(var(--card),1)] p-3 text-sm outline-none focus:ring-2 focus:ring-[rgba(var(--emerald),0.35)]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-[rgb(var(--muted))]">Personal details (optional)</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Write your situation briefly…"
            className="mt-1 w-full min-h-[92px] resize-y rounded-xl border border-[rgba(var(--border),1)] bg-[rgba(var(--card),1)] p-3 text-sm outline-none focus:ring-2 focus:ring-[rgba(var(--emerald),0.35)]"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-[rgb(var(--muted))]">Your dua will appear in Arabic, transliteration, and English.</div>
          <Button
            onClick={async () => {
              setBusy(true);
              try {
                const res = await fetch("/.netlify/functions/dua", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userName: name,
                    target: whoFor,
                    category: categoryId,
                    details: details,
                    length: "medium",
                  }),
                });

                const json = await res.json();
                if (!res.ok) throw new Error(json?.error || "Failed to generate dua");

                setDua({
                  arabic: json.arabic,
                  transliteration: json.transliteration,
                  english: json.english,
                });
              } catch (e: any) {
                setDua({
                  arabic: "",
                  transliteration: "",
                  english: `Error: ${e?.message || "Unknown error"}`,
                });
              } finally {
                setBusy(false);
              }
            }}
          >
            Generate
          </Button>

        </div>
      </div>

      {dua ? (
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-2xl p-4 bg-[rgba(var(--card2),0.75)] spiritual-border">
            <div className="text-xs font-semibold text-[rgb(var(--muted))]">Arabic</div>
            <div className="mt-2 text-right text-xl leading-relaxed font-semibold whitespace-pre-wrap">{dua.arabic}</div>
          </div>
          <div className="rounded-2xl p-4 bg-[rgba(var(--card2),0.75)] spiritual-border-sky">
            <div className="text-xs font-semibold text-[rgb(var(--muted))]">Transliteration</div>
            <div className="mt-2 text-sm italic whitespace-pre-wrap">{dua.transliteration}</div>
          </div>
          <div className="rounded-2xl p-4 bg-[rgba(var(--card2),0.75)] spiritual-border-emerald">
            <div className="text-xs font-semibold text-[rgb(var(--muted))]">English</div>
            <div className="mt-2 text-sm whitespace-pre-wrap">{dua.english}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
