import { create } from 'zustand';

import { ComplianceResult } from '@/types/doc-compliance';

interface DocComplianceState {
  results: ComplianceResult[];
  content: string;
  setResults: (results: ComplianceResult[], content: string) => void;
  setContent: (content: string) => void;
  clear: () => void;
}

export const useDocComplianceStore = create<DocComplianceState>((set) => ({
  results: [],
  content: '',
  setResults: (results, content) => set({ results, content }),
  setContent: (content) => set({ content }),
  clear: () => set({ results: [], content: '' }),
}));
