'use client';

import { useState } from 'react';

import { ResponseChat } from '@/components/resolver/response-chat';
import { ResponseDisplay } from '@/components/resolver/response-display';
import { ResponseHeader } from '@/components/resolver/response-header';

// Chat message type for the sidebar - now uses string content for markdown
interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  /** For AI messages: the full markdown content. For user messages: the text. */
  content: string;
}

// Mock chat messages for demonstration with markdown content
const MOCK_AI_RESPONSE = `**Subject:** Your Recent Billing Concern

Dear [Customer Name],

Thank you for bringing your concern to our attention. We sincerely apologize for the confusion regarding the late fee on your account.

Upon review, we've confirmed that your payment was made on time, and the late fee was applied in error. As a result, we have reversed the charge from your account.

We are also reviewing our internal billing processes to avoid such issues in the future.

We appreciate your understanding, and please feel free to reach out if you have any further questions.

Best regards,
[Compliance Team]`;

const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    type: 'ai',
    content: MOCK_AI_RESPONSE,
  },
  {
    id: '2',
    type: 'user',
    content: 'Make it more formal and apologetic compliant.',
  },
  {
    id: '3',
    type: 'ai',
    content: MOCK_AI_RESPONSE,
  },
];

export default function ResolverResponsePage() {
  const [chatMessages, setChatMessages] =
    useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);

  // Get the latest AI response for display
  const latestAiMessage = [...chatMessages]
    .reverse()
    .find((m) => m.type === 'ai');
  const activeContent = latestAiMessage?.content || '';

  const handleExport = () => {
    // TODO: Implement PDF export
  };

  const handleRevert = (id: string) => {
    // Find the index of the clicked AI message
    const messageIndex = chatMessages.findIndex((m) => m.id === id);
    if (messageIndex === -1) return;

    const message = chatMessages[messageIndex];
    if (message.type !== 'ai') return;

    // Check if the previous message is a user message (the refinement that triggered this AI response)
    // If so, remove it as well
    let removeFromIndex = messageIndex;
    if (messageIndex > 0 && chatMessages[messageIndex - 1].type === 'user') {
      removeFromIndex = messageIndex - 1;
    }

    // Remove the user message, the clicked AI message, and all messages after
    setChatMessages((prev) => prev.slice(0, removeFromIndex));
  };

  const handleRefine = (prompt: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: prompt,
    };

    // TODO: Call API to get refined response
    // For now, add a mock AI response
    const aiResponse: ChatMessage = {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content: `**Subject:** Your Recent Billing Concern

Dear [Customer Name],

*[Refined response based on: "${prompt}"]*

Thank you for bringing your concern to our attention. We sincerely apologize for the confusion regarding the late fee on your account.

Upon review, we've confirmed that your payment was made on time, and the late fee was applied in error. As a result, we have reversed the charge from your account.

Best regards,
[Compliance Team]`,
    };

    setChatMessages((prev) => [...prev, userMessage, aiResponse]);
  };

  return (
    <div className="flex h-screen w-full bg-[#F8F9FF] overflow-hidden font-poppins">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {/* Header */}
        <div className="mb-6">
          <ResponseHeader />
        </div>

        <div className="flex h-full">
          {/* Response Display - Always show */}
          <ResponseDisplay content={activeContent} onExport={handleExport} />

          {/* Chat Sidebar */}
          <ResponseChat
            messages={chatMessages}
            onRevert={handleRevert}
            onRefine={handleRefine}
          />
        </div>
      </div>
    </div>
  );
}
