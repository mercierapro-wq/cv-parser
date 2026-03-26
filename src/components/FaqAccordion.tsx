"use client";

import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState("");

  const toggle = (index: number) => {
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = normalizedQuery
    ? items.filter(
        (item) =>
          item.question.toLowerCase().includes(normalizedQuery) ||
          item.answer.toLowerCase().includes(normalizedQuery)
      )
    : items;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une question…"
          className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Effacer la recherche"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results count when searching */}
      {normalizedQuery && (
        <p className="text-xs text-slate-400 font-medium px-1">
          {filteredItems.length === 0
            ? "Aucun résultat"
            : `${filteredItems.length} résultat${filteredItems.length > 1 ? "s" : ""}`}
        </p>
      )}

      {/* Accordion */}
      <div className="space-y-3">
        {filteredItems.map((item, i) => {
          // When searching, use the item's position in the original array as key for stable toggle state
          const originalIndex = items.indexOf(item);
          const isOpen = normalizedQuery ? true : openIndexes.has(originalIndex);
          return (
            <div
              key={originalIndex}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => !normalizedQuery && toggle(originalIndex)}
                aria-expanded={isOpen}
                className={`w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors ${
                  normalizedQuery ? "cursor-default" : "hover:bg-slate-50"
                }`}
              >
                <span className="font-semibold text-slate-900 text-base leading-snug">
                  {item.question}
                </span>
                {!normalizedQuery && (
                  <ChevronDown
                    className={`w-5 h-5 text-indigo-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>
              <div
                className={`grid transition-all duration-200 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-slate-600 leading-relaxed text-sm">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
