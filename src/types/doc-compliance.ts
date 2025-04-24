export interface ComplianceResult {
  original: string | null | undefined;
  compliant: boolean;
  suggestion: string;
  reason: string;
  citations: unknown[];
}
