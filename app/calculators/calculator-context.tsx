'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CalculatorOutcome } from '../../lib/calculators';
import type { AssessmentYear } from '../../lib/rules';

export type CalculatorScenario = {
  id: string;
  title: string;
  calculatorId: string;
  year: AssessmentYear;
  inputs: Record<string, string>;
  outcome: CalculatorOutcome;
  createdAt: string;
  example: boolean;
};

type CalculatorSession = {
  year: AssessmentYear;
  setYear: (year: AssessmentYear) => void;
  drafts: Record<string, Record<string, string>>;
  setDraft: (id: string, inputs: Record<string, string>) => void;
  examples: Record<string, boolean>;
  setExample: (id: string, example: boolean) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  scenarios: CalculatorScenario[];
  setScenarios: (scenarios: CalculatorScenario[]) => void;
  crossYear: boolean;
  setCrossYear: (allow: boolean) => void;
};

const CalculatorContext = createContext<CalculatorSession | null>(null);
const FAVORITES_KEY = 'joff-favorite-calculator-slugs-v1';

export function CalculatorSessionProvider({ children }: { children: ReactNode }) {
  const [year, setYear] = useState<AssessmentYear>(2026);
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>({});
  const [examples, setExamples] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [scenarios, setScenarios] = useState<CalculatorScenario[]>([]);
  const [crossYear, setCrossYear] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
      if (Array.isArray(stored)) {
        setFavorites(stored.filter((slug): slug is string =>
          typeof slug === 'string' && /^[a-z0-9-]{1,80}$/.test(slug),
        ).slice(0, 36));
      }
    } catch {
      // A preference failure never prevents calculator use.
    }
  }, []);

  function toggleFavorite(id: string) {
    setFavorites((previous) => {
      const next = previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id];
      try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); } catch { /* optional preference */ }
      return next;
    });
  }

  return (
    <CalculatorContext.Provider value={{
      year, setYear, drafts,
      setDraft: (id, inputs) => setDrafts((previous) => ({ ...previous, [id]: inputs })),
      examples,
      setExample: (id, example) => setExamples((previous) => ({ ...previous, [id]: example })),
      favorites, toggleFavorite, scenarios, setScenarios, crossYear, setCrossYear,
    }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculatorSession() {
  const session = useContext(CalculatorContext);
  if (!session) throw new Error('Calculator session context is required.');
  return session;
}
