export interface ComplianceResult {
  original: string;
  compliant: boolean;
  suggestion: string;
  reason: string;
  citations: unknown[];
}
