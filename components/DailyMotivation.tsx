"use client";

import { useMemo } from "react";
import { Badge } from "./Badge";

type Motivation = {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  sourceTitle: string;
  sourceUrl?: string;
  tag?: string;
};

const MOTIVATIONS: Motivation[] = [
  {
    id: "mot-1",
    tag: "Patience",
    arabic: "لَا يُكَلِّفُ ٱللَّـهُ نَفْسًا إِلَّا وُسْعَهَا",
    transliteration: "Lā yukallifu Allāhu nafsan illā wus'ahā",
    english: "Allah does not burden a soul beyond what it can bear.",
    sourceTitle: "Qur’an 2:286",
    sourceUrl: "https://quran.com/2/286"
  },
  {
    id: "mot-2",
    tag: "Character",
    arabic: "إِنَّ ٱللَّـهَ يَأْمُرُ بِٱلْعَدْلِ وَٱلْإِحْسَانِ",
    transliteration: "Inna Allāha ya'muru bil-'adli wal-iḥsān",
    english: "Indeed, Allah commands justice and excellence.",
    sourceTitle: "Qur’an 16:90",
    sourceUrl: "https://quran.com/16/90"
  },
  {
    id: "mot-3",
    tag: "Sincerity",
    arabic: "إِنَّمَا ٱلْأَعْمَالُ بِٱلنِّيَّاتِ",
    transliteration: "Innamā al-a'mālu bin-niyyāt",
    english: "Actions are judged by intentions.",
    sourceTitle: "Hadith (Bukhari & Muslim)",
    sourceUrl: "https://sunnah.com/bukhari:1"
  },
  {
    id: "mot-4",
    tag: "Ease",
    arabic: "يَسِّرُوا وَلَا تُعَسِّرُوا",
    transliteration: "Yassirū wa lā tu'assirū",
    english: "Make things easy and do not make them difficult.",
    sourceTitle: "Hadith (Bukhari & Muslim)",
    sourceUrl: "https://sunnah.com/bukhari:69"
  }
];

function dayIndex(len: number) {
  const d = new Date();
  const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return len ? hash % len : 0;
}

export function DailyMotivation() {
  const item = useMemo(() => MOTIVATIONS[dayIndex(MOTIVATIONS.length)], []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-extrabold tracking-tight">Daily Motivation</div>
        {item.tag ? <Badge>{item.tag}</Badge> : null}
      </div>

      <div
        className="rounded-2xl p-4 spiritual-border motivation-board"
        style={{ backgroundColor: "rgb(var(--card2) / 0.75)" }}
      >
        <div className="text-right text-xl md:text-2xl font-semibold leading-relaxed">{item.arabic}</div>
        <div className="mt-2 text-sm text-[rgb(var(--muted))] italic">{item.transliteration}</div>
        <div className="mt-3 text-sm md:text-base leading-relaxed">{item.english}</div>

        <div className="mt-4 text-xs text-[rgb(var(--muted))]">
          Source: {item.sourceUrl ? (
            <a className="underline hover:opacity-80" href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceTitle}</a>
          ) : item.sourceTitle}
        </div>
      </div>
    </div>
  );
}
