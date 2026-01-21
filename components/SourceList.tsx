"use client";

import { ExternalLink } from "lucide-react";
import { Badge } from "./Badge";

export type Citation = {
  id: string;
  index: number;
  title: string;
  url?: string;
  type: string;
  snippet: string;
};

export function SourceList({ citations }: { citations: Citation[] }) {
  if (!citations?.length) {
    return (
      <div className="text-sm text-[rgb(var(--muted))]">
        No sources matched your question in the local knowledge base.
        <div className="mt-2 text-xs text-[rgb(var(--muted))] opacity-80">
          Tip: add more passages in <code className="px-1 py-0.5 rounded bg-[rgba(var(--card2),1)]">data/knowledge.json</code>.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {citations.map(c => (
        <div key={c.id} className="rounded-xl border border-[rgba(var(--border),1)] p-3 bg-[rgba(var(--card),1)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">{`[${c.index}] ${c.title}`}</div>
              <div className="mt-1 flex gap-2 items-center">
                <Badge className="text-[11px]">{c.type}</Badge>
                {c.url ? (
                  <a className="text-xs text-[rgb(var(--muted))] hover:opacity-80 inline-flex items-center gap-1" href={c.url} target="_blank" rel="noreferrer">
                    Open <ExternalLink size={14} />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs text-[rgb(var(--fg))] opacity-90 leading-relaxed">{c.snippet}</div>
        </div>
      ))}
    </div>
  );
}
