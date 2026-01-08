'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { ResolverMessage, useResolver } from '@/hooks/useResolver';
import { ResponseChat } from '@/components/resolver/response-chat';
import { ResponseDisplay } from '@/components/resolver/response-display';
import { ResponseHeader } from '@/components/resolver/response-header';
import { ResponseKeyPoints } from '@/components/resolver/response-key-points';
import { ResponseTab, ResponseTabs } from '@/components/resolver/response-tabs';

export default function ResolverResponsePage() {
  const { id } = useParams();
  const { sendMessage, useComplaintDetails, useKeyPoints, useMessagesList } =
    useResolver();

  // Queries
  const { data: details, isLoading: isLoadingDetails } = useComplaintDetails(
    id as string
  );
  const { data: messagesData, isLoading: isLoadingMessages } = useMessagesList(
    id as string
  );
  const { data: keyPointsData, isLoading: isLoadingKeyPoints } = useKeyPoints(
    id as string
  );

  const [chatMessages, setChatMessages] = useState<ResolverMessage[]>([]);
  const [activeTab, setActiveTab] = useState<ResponseTab>('chat');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [hasTriggeredAuto, setHasTriggeredAuto] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  const handleRefine = useCallback(
    async (prompt: string) => {
      const userMessage: ResolverMessage = {
        id: `user-${Date.now()}`,
        complaint: id as string,
        user: 'USER',
        content: prompt,
        created_at: new Date().toISOString(),
        done: true,
      };

      const aiMessageId = `ai-${Date.now()}`;
      const placeholderAiMessage: ResolverMessage = {
        id: aiMessageId,
        complaint: id as string,
        user: 'AI',
        content: '',
        reasoning: '',
        created_at: new Date().toISOString(),
        done: false,
      };

      setChatMessages((prev) => [...prev, userMessage, placeholderAiMessage]);
      setIsStreaming(true);
      setStreamingContent('');

      try {
        const aiResponse = await sendMessage({
          complaintId: id as string,
          message: prompt,
          onChunkUpdate: (chunk) => {
            setChatMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.id === aiMessageId) {
                return [
                  ...prev.slice(0, -1),
                  {
                    ...last,
                    content: chunk.content || last.content,
                    reasoning: chunk.reasoning || last.reasoning,
                    done: chunk.done,
                  },
                ];
              }
              return prev;
            });

            if (chunk.content) {
              setStreamingContent(chunk.content);
            }
          },
        });

        setChatMessages((prev) => {
          const index = prev.findIndex((m) => m.id === aiMessageId);
          if (index !== -1) {
            const newMessages = [...prev];
            newMessages[index] = aiResponse;
            return newMessages;
          }
          return prev;
        });
      } catch (error: unknown) {
        console.error('Failed to refine response:', error);
        const err = error as Error;
        setChatMessages((prev) => {
          const index = prev.findIndex((m) => m.id === aiMessageId);
          if (index !== -1) {
            const newMessages = [...prev];
            newMessages[index] = {
              ...newMessages[index],
              isError: true,
              errorChunk: err.message || 'An error occurred',
              done: true,
            };
            return newMessages;
          }
          return prev;
        });
      } finally {
        setIsStreaming(false);
        setStreamingContent('');
      }
    },
    [id, sendMessage]
  );

  // Sync messages from API to local state
  useEffect(() => {
    if (!isLoadingMessages && messagesData?.results && !hasSynced) {
      const mappedMessages: ResolverMessage[] = messagesData.results
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          id: m.id,
          complaint: id as string,
          user: m.role === 'assistant' ? 'AI' : 'USER',
          content: m.content,
          created_at: m.created_at,
          done: true,
        }));
      setChatMessages(mappedMessages);
      setHasSynced(true);
    }
  }, [messagesData, id, hasSynced, isLoadingMessages]);

  // Auto-trigger first analysis if no messages exist
  useEffect(() => {
    if (
      !isLoadingMessages &&
      !isLoadingDetails &&
      messagesData &&
      details &&
      !hasTriggeredAuto
    ) {
      // Check if there are no user/assistant messages
      const existingMessages = messagesData.results.filter(
        (m) => m.role !== 'system'
      );

      if (existingMessages.length === 0) {
        setHasTriggeredAuto(true);
        const initialPrompt =
          details.context?.system_prompt ||
          'Analyze this complaint and provide a professional response.';
        handleRefine(initialPrompt);
      } else {
        // If messages already exist, we don't need to auto-trigger
        setHasTriggeredAuto(true);
      }
    }
  }, [
    isLoadingMessages,
    isLoadingDetails,
    messagesData,
    details,
    hasTriggeredAuto,
    handleRefine,
  ]);

  const handleRevert = (id: string | number) => {
    const messageIndex = chatMessages.findIndex((m) => m.id === id);
    if (messageIndex === -1) return;

    const message = chatMessages[messageIndex];
    if (message.user !== 'AI') return;

    let removeFromIndex = messageIndex;
    if (messageIndex > 0 && chatMessages[messageIndex - 1].user === 'USER') {
      removeFromIndex = messageIndex - 1;
    }

    setChatMessages((prev) => prev.slice(0, removeFromIndex));
  };

  // Get the latest AI response for display
  const latestAiMessage = [...chatMessages]
    .reverse()
    .find((m) => m.user === 'AI');

  // Use streaming content if actively streaming, otherwise use latest message
  // If no AI message yet and not streaming, use extracted text or placeholder
  const activeContent = isStreaming
    ? streamingContent
    : latestAiMessage?.content || details?.description || '';

  const handleExport = async () => {
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { PdfDocument } = await import(
        '@/components/resolver/pdf-document'
      );

      const blob = await pdf(<PdfDocument content={activeContent} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compliance-report-${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  const handleRetry = () => {
    const lastMessage = chatMessages[chatMessages.length - 1];
    if (lastMessage?.user === 'AI' && lastMessage.isError) {
      const prevUserMessage = chatMessages[chatMessages.length - 2];
      if (prevUserMessage?.user === 'USER') {
        // Remove both and re-refine
        setChatMessages((prev) => prev.slice(0, -2));
        handleRefine(prevUserMessage.content);
      }
    }
  };

  if ((isLoadingDetails || isLoadingMessages) && chatMessages.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#04338B] border-t-transparent" />
          <p className="text-[#04338B] font-medium">
            Loading complaint details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-poppins">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col px-6 py-4  overflow-hidden">
        {/* Header */}
        <div className="mb-3">
          <ResponseHeader />
        </div>

        <div className="flex h-full bg-[#F5F8FF] p-2 rounded-xl gap-3">
          {/* Response Display - Always show */}
          <ResponseDisplay content={activeContent} onExport={handleExport} />

          {/* Right Panel: Chat or Key Points */}
          <div className="w-[40svw] shrink-0 bg-white rounded-[10px] flex flex-col h-[calc(100vh-100px)] overflow-hidden">
            <div className="p-4 pb-0">
              <ResponseTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {activeTab === 'chat' ? (
                <ResponseChat
                  messages={chatMessages}
                  onRevert={handleRevert}
                  onRefine={handleRefine}
                  onRetry={handleRetry}
                />
              ) : (
                <ResponseKeyPoints
                  points={keyPointsData?.key_points || []}
                  isLoading={isLoadingKeyPoints}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
