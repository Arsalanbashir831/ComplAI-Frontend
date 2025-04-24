'use client';

import { useEffect, useState } from 'react'; // Import useState
import { useRouter } from 'next/navigation';
import { useDocComplianceStore } from '@/store/use-doc-compliance-store';
import { useEditorStore } from '@/store/use-editor-store';

import { ComplianceResult } from '@/types/doc-compliance';
import { applySuggestionAcross } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton'; // Example loading component
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { Editor } from '@/components/dashboard/doc-compliance/editor/editor';
import { ToolBar } from '@/components/dashboard/doc-compliance/editor/toolbar';
import IssueList from '@/components/dashboard/doc-compliance/issue-list';

// Define the structure of the processed result item expected from the API
interface ProcessedResultItem extends ComplianceResult {
  highlightedOriginalHtml: string | null;
  suggestionHtml: string | null;
}

// Define the structure of the API response
interface ProcessComplianceResponseBody {
  fullHighlightedHtml: string;
  processedResults: ProcessedResultItem[];
}

export default function DocumentIdPage() {
  const router = useRouter();
  // Get raw content and results from the store
  const { results, content = '' } = useDocComplianceStore();
  const { editor } = useEditorStore(); // Get editor instance

  // --- State for fetched data, loading, and errors ---
  const [processedData, setProcessedData] =
    useState<ProcessComplianceResponseBody | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading initially
  const [error, setError] = useState<string | null>(null);
  // --- ---

  console.log('DocumentIdPage Render:', { results, content, editor: !!editor });

  // --- Fetch processed data from the API ---
  useEffect(() => {
    // Only fetch if we have content and results to process
    if (!content || !results || results.length === 0) {
      console.log('Skipping fetch: No content or results.');
      // If there's content but no results, we can just use the original content
      if (content) {
        setProcessedData({
          fullHighlightedHtml: content,
          processedResults: [],
        });
      } else {
        setProcessedData(null); // Ensure no stale data if content becomes empty
      }
      setIsLoading(false);
      setError(null);
      return; // Exit effect
    }

    const fetchProcessedData = async () => {
      console.log('Starting fetch to /api/process-compliance...');
      setIsLoading(true);
      setError(null);
      setProcessedData(null); // Clear previous data

      try {
        const response = await fetch('/api/process-compliance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ htmlContent: content, results }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Try to get error details
          console.error('API Error Response:', errorData);
          throw new Error(
            errorData.error ||
              `API request failed with status ${response.status}`
          );
        }

        const data: ProcessComplianceResponseBody = await response.json();
        console.log('API Success Response:', data);
        setProcessedData(data);
      } catch (err: unknown) {
        // Handle errors gracefully
        if (err instanceof Error) {
          console.error('Error fetching processed data:', err.message);
          setError(err.message || 'Failed to fetch processed compliance data.');
        } else {
          console.error('Error fetching processed data:', err);
        }
        setProcessedData(null); // Clear data on error
      } finally {
        setIsLoading(false);
        console.log('Fetch attempt finished.');
      }
    };

    fetchProcessedData();

    // Depend on content and results (stringified results ensure deep comparison triggers effect)
  }, [content, JSON.stringify(results)]);
  // --- ---

  // --- Redirect if content is missing after initial check ---
  useEffect(() => {
    // Check *after* loading attempt is finished and there's still no content
    if (
      !isLoading &&
      !error &&
      !processedData?.fullHighlightedHtml &&
      !content
    ) {
      console.log('Redirecting: No content available.');
      router.push('/doc-compliance');
    }
  }, [isLoading, error, processedData, content, router]);

  // --- Handlers using original results array ---
  // These might need adjustment if they need the processed snippets later
  const handleResolveAll = () => {
    if (!editor || !results) return; // Use original results for now
    results.forEach(({ original, suggestion }) => {
      if (original && suggestion)
        applySuggestionAcross(editor, original, suggestion);
    });
  };

  const handleResolveIssue = (idx: number) => {
    if (!editor || !results || !results[idx]) return; // Use original results for now
    const { original, suggestion } = results[idx];
    if (original && suggestion) {
      applySuggestionAcross(editor, original, suggestion);
    }
  };
  // --- ---

  // Determine content to display in the editor
  const editorContent = processedData?.fullHighlightedHtml ?? '';

  // --- Render Logic ---
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header + Toolbar */}
      <div className="px-4 pt-2 bg-[#FAFBFD] space-y-4 print:hidden z-10">
        <DashboardHeader title="Document Compliance" />
        <ToolBar />
      </div>

      <div className="flex flex-1 mt-2 px-4 gap-x-4 overflow-hidden print:hidden">
        {/* Left: Editor Area */}
        <div className="flex-1">
          <ScrollArea className="flex-1 w-full bg-white rounded-lg p-4 h-[calc(100vh-130px)]">
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-full" />
                <p className="text-center text-sm text-muted-foreground pt-4">
                  Processing document...
                </p>
              </div>
            )}
            {error && (
              <p className="text-red-600">
                Error loading compliance data: {error}
              </p>
            )}
            {!isLoading && !error && (
              <Editor
                // Use a key that changes only when the *content* itself fundamentally changes,
                // allowing the editor to manage internal updates better if possible.
                // If editor state preservation is not critical on results change, the old key is fine.
                // Let's use editorContent for the key now. If it causes issues, revert to results based key.
                key={editorContent}
                // Pass the fetched highlighted content
                initialContent={editorContent}
                // Pass original results (IssueList might need processedResults later)
                results={results}
              />
            )}
          </ScrollArea>
        </div>

        {/* Right: issues + “Resolve all” */}
        <div className="w-full max-w-[300px] flex-shrink-0">
          {/* Pass original results for now. Might need processedData.processedResults later */}
          <IssueList
            results={results}
            // Optionally pass processed results if IssueList is adapted to use them
            // processedResults={processedData?.processedResults}
            listClassName="h-[calc(100vh-280px)]"
            showResolveIssuesButton
            onResolveIssues={handleResolveAll}
            onResolveIssue={handleResolveIssue}
          />
        </div>
      </div>
    </div>
  );
}
