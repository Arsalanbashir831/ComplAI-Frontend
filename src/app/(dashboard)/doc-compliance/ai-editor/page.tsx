'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDocComplianceStore } from '@/store/use-doc-compliance-store';
import { useEditorStore } from '@/store/use-editor-store';

import { ComplianceResult } from '@/types/doc-compliance';
import { applySuggestionAcross } from '@/lib/resolve-issues'; // Ensure this path is correct
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
// --- Import necessary types and components ---
import DashboardHeader from '@/components/dashboard/dashboard-header';
import { Editor } from '@/components/dashboard/doc-compliance/editor/editor';
import { ToolBar } from '@/components/dashboard/doc-compliance/editor/toolbar';
import IssueList from '@/components/dashboard/doc-compliance/issue-list';

// --- Type definitions ---
interface ProcessedResultItem extends ComplianceResult {
  highlightedOriginalHtml: string | null;
  suggestionHtml: string | null;
}

interface ProcessComplianceResponseBody {
  fullHighlightedHtml: string;
  processedResults: ProcessedResultItem[];
}

export default function DocumentIdPage() {
  const router = useRouter();
  const { results: originalResults, content = '' } = useDocComplianceStore(); // Rename original results
  const { editor } = useEditorStore();

  // --- State ---
  const [processedData, setProcessedData] =
    useState<ProcessComplianceResponseBody | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Only log on client side to prevent hydration issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('DocumentIdPage Render:', {
        hasOriginalResults: !!originalResults?.length,
        hasContent: !!content,
        hasEditor: !!editor,
        isLoading,
        hasProcessedData: !!processedData,
      });
    }
  }, [originalResults, content, editor, isLoading, processedData]);

  // Extract the stringified results for dependency comparison
  const originalResultsString = JSON.stringify(originalResults);

  // --- Fetch processed data ---
  useEffect(() => {
    if (!content) return;

    const fetchProcessedData = async () => {
      console.log('Starting fetch to /api/process-compliance-open-ai...');
      setIsLoading(true);
      setError(null);
      setProcessedData(null);

      try {
        const response = await fetch('/api/process-compliance-open-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Send original content and original results to the API
          body: JSON.stringify({
            htmlContent: content,
            results: originalResults,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error Response:', response.status, errorData);
          throw new Error(
            errorData.error ||
              `API request failed with status ${response.status}`
          );
        }

        const data: ProcessComplianceResponseBody = await response.json();
        console.log('API Success Response:', data);
        setProcessedData(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error fetching processed data:', err.message);
          setError(err.message || 'Failed to fetch processed compliance data.');
        } else {
          console.error('Unknown error fetching processed data:', err);
          setError('An unknown error occurred.');
        }
        setProcessedData(null);
      } finally {
        setIsLoading(false);
        console.log('Fetch attempt finished.');
      }
    };

    fetchProcessedData();

    // Depend on content and the original results to trigger fetch
  }, [content, originalResultsString]); // Use the extracted variable

  // --- Redirect if no content after loading attempt ---
  useEffect(() => {
    if (!isLoading && !error && !content) {
      // Check original content
      console.log('Redirecting: No base content available.');
      router.push('/doc-compliance'); // Redirect to a safe page
    }
  }, [isLoading, error, content, router]);

  const handleResolveIssue = useCallback(
    (idx: number) => {
      // Guard clauses: need editor AND the specific processed result
      if (
        !editor ||
        !processedData?.processedResults ||
        !processedData.processedResults[idx]
      ) {
        console.warn(
          `Resolve Issue ${idx}: Editor or processed result not available.`
        );
        return;
      }
      // Get the specific processed result by index
      const { original, suggestionHtml, compliant } =
        processedData.processedResults[idx];

      console.log(`Resolve Issue ${idx}: Applying suggestion...`);

      let appliedSuccessfully = false;
      // Apply only if not compliant, original text exists, and suggestionHtml exists
      if (!compliant && original && suggestionHtml) {
        // Call the utility function
        try {
          applySuggestionAcross(editor, original, suggestionHtml);
          appliedSuccessfully = true; // Assume success if no error thrown
        } catch (e) {
          console.error(`Error applying suggestion for issue ${idx}:`, e);
        }
      } else {
        console.warn(
          `Resolve Issue ${idx}: Cannot apply. Compliant: ${compliant}, Has Original: ${!!original}, Has suggestionHtml: ${!!suggestionHtml}`
        );
      }

      // --- **UPDATE STATE HERE** ---
      // Only update state if the suggestion was successfully applied
      if (appliedSuccessfully) {
        setProcessedData((currentData) => {
          if (!currentData) return null; // Should not happen if we got here, but safe check

          // Create a new array excluding the resolved issue
          const updatedResults = currentData.processedResults.filter(
            (_, index) => index !== idx
          );

          // Return new state object
          return {
            ...currentData, // Keep other properties like fullHighlightedHtml
            processedResults: updatedResults,
          };
        });
        console.log(
          `Resolve Issue ${idx}: Finished applying suggestion and updated UI state.`
        );
      } else {
        console.log(
          `Resolve Issue ${idx}: Finished attempting suggestion (no change applied or error occurred).`
        );
      }
    },
    [editor, processedData]
  ); // Dependencies for useCallback

  const handleResolveAll = useCallback(() => {
    // Guard clauses: need editor AND processedData with its results
    if (!editor || !processedData?.processedResults) {
      console.warn('Resolve All: Editor or processed results not available.');
      return;
    }
    console.log('Resolve All: Applying suggestions...');

    let changesMade = false;
    // Keep track of results that *couldn't* be applied or were already compliant
    const remainingResults: ProcessedResultItem[] = [];

    // Iterate through the *current* processed results
    processedData.processedResults.forEach((result) => {
      const { original, suggestionHtml, compliant } = result;
      // Try to apply only if not compliant and suggestionHtml exists
      if (!compliant && original && suggestionHtml) {
        try {
          applySuggestionAcross(editor, original, suggestionHtml);
          changesMade = true; // Mark that at least one change was attempted/applied
          // If applied, don't add it to remainingResults
        } catch (e) {
          console.error(
            `Error applying suggestion during Resolve All for: ${original}`,
            e
          );
          remainingResults.push(result); // Keep if application failed
        }
      } else {
        // Keep the result if it was already compliant or couldn't be applied
        remainingResults.push(result);
      }
    });

    console.log('Resolve All: Finished applying suggestions.');

    // --- **UPDATE STATE HERE** ---
    // Update state only if changes were potentially made
    if (changesMade) {
      setProcessedData((currentData) => {
        if (!currentData) return null;
        // Update the list to only contain the results that were kept
        return {
          ...currentData,
          processedResults: remainingResults,
        };
      });
      console.log('Resolve All: Updated UI state.');
    } else {
      console.log('Resolve All: No changes applied to editor.');
    }
  }, [editor, processedData]); // Dependencies for useCallback

  // Determine content for the editor: use processed highlighted HTML if available
  const editorContent = processedData?.fullHighlightedHtml ?? content; // Fallback to original content

  // --- Render Logic ---
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header + Toolbar */}
      <div className="px-4 pt-2 bg-[#FAFBFD] space-y-4 print:hidden z-10">
        <DashboardHeader title="Document Compliance" />
        {/* Render Toolbar only if editor exists */}
        {editor && <ToolBar />}
      </div>

      <div className="flex flex-1 mt-2 px-4 gap-x-4 overflow-hidden print:hidden">
        {/* Left: Editor Area */}
        <div className="flex-1 overflow-hidden">
          {' '}
          {/* Added overflow-hidden */}
          <ScrollArea className="w-full bg-white rounded-lg p-4 h-[calc(100vh-130px)]">
            {isLoading && (
              <div className="space-y-2 p-4">
                {' '}
                {/* Added padding */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-full" />
                <p className="text-center text-sm text-muted-foreground pt-4">
                  Processing document... this may take a moment.
                </p>
              </div>
            )}
            {error && (
              <p className="text-red-600 p-4">
                {' '}
                {/* Added padding */}
                Error loading compliance data: {error}
              </p>
            )}
            {/* Render Editor only when not loading, no error, and content exists */}
            {!isLoading && !error && content && (
              <Editor
                // Use a key that changes when the content source changes
                key={processedData ? 'processed' : 'original'}
                initialContent={editorContent}
                // Pass processed results (or original if not processed yet)
                // The Editor might use this for internal features later
                results={
                  processedData?.processedResults ?? originalResults ?? []
                }
              />
            )}
            {/* Handle case where loading finished, no error, but still no content */}
            {!isLoading && !error && !content && (
              <p className="text-center text-muted-foreground p-4">
                No document content found.
              </p>
            )}
          </ScrollArea>
        </div>

        {/* Right: issues + "Resolve all" */}
        <div className="w-full max-w-[300px] flex-shrink-0">
          {
            isLoading && (
              <Skeleton className="h-full w-full" />
            ) /* Skeleton for issue list */
          }
          {error && <p className="text-red-500">Error loading issues.</p>}
          {/* Render IssueList only when processing is done (or failed) and there's processed data */}
          {!isLoading && !error && processedData && (
            <IssueList
              // IMPORTANT: Pass the processed results from the API
              results={processedData.processedResults}
              listClassName="h-[calc(100vh-260px)]" // Adjust height as needed
              showResolveIssuesButton
              onResolveIssues={handleResolveAll}
              onResolveIssue={handleResolveIssue}
            />
          )}
          {/* Handle cases where loading is done, no error, but no processed data */}
          {!isLoading &&
            !error &&
            !processedData &&
            originalResults &&
            originalResults.length > 0 && (
              <p className="text-muted-foreground p-2">
                Could not process compliance issues.
              </p>
            )}
          {!isLoading &&
            !error &&
            !processedData &&
            (!originalResults || originalResults.length === 0) && (
              <p className="text-muted-foreground p-2">
                No compliance issues found or processed.
              </p>
            )}
        </div>
      </div>
    </div>
  );
}
