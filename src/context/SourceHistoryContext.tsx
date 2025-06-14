
import React, { createContext, useContext, useEffect, useState } from "react";

type SourceType = "PDF" | "Website";
type SourceRecord = {
  id: string;
  type: SourceType;
  label: string; // File name or URL
  file?: FileMeta;
  url?: string;
  created: number;
};
type FileMeta = { name: string };

interface SourceHistoryContextProps {
  sources: SourceRecord[];
  addSource: (src: SourceRecord) => void;
  removeSource: (id: string) => void;
  clear: () => void;
}

const SourceHistoryContext = createContext<SourceHistoryContextProps | undefined>(undefined);

const STORAGE_KEY = "lov_src_hist_v2";

export function SourceHistoryProvider({ children }: { children: React.ReactNode }) {
  const [sources, setSources] = useState<SourceRecord[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSources(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
    } catch {}
  }, [sources]);

  const addSource = (src: SourceRecord) => {
    setSources((prev) => {
      // Avoid duplicates by ID, most recent first
      const filtered = prev.filter((item) => item.id !== src.id);
      return [src, ...filtered].slice(0, 50);
    });
  };

  const removeSource = (id: string) => {
    setSources((prev) => prev.filter((item) => item.id !== id));
  };

  const clear = () => setSources([]);

  return (
    <SourceHistoryContext.Provider value={{ sources, addSource, removeSource, clear }}>
      {children}
    </SourceHistoryContext.Provider>
  );
}

export function useSourceHistory() {
  const ctx = useContext(SourceHistoryContext);
  if (!ctx) throw new Error("useSourceHistory must be used within SourceHistoryProvider");
  return ctx;
}
