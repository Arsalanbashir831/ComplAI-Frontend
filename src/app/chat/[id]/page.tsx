'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useChatContext } from '@/contexts/chat-context';
import { useChatMessages } from '@/hooks/useChat';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatMessages } from '@/components/chat/chat-messages';
import { MessageInput } from '@/components/chat/message-input';

export default function SpecificChatPage() {
    const { id } = useParams();
    const chatId = id as string;
    const [retryingId, setRetryingId] = useState<number | null>(null);

    const { messages, setMessages } = useChatContext();
    const { data: chatMessages, isLoading, error } = useChatMessages(chatId);

    const [retryMap, setRetryMap] = useState<Map<number, () => void>>(new Map());

    useEffect(() => {
        if (chatMessages) {
            setMessages(chatMessages);
        }
    }, [chatMessages, setMessages]);

    if (!chatId) return <div className="p-8 text-red-500">❌ Chat ID missing</div>;
    if (isLoading) return <div className="p-8">⏳ Loading messages...</div>;
    if (error) return <div className="p-8 text-red-500">❌ {error.message}</div>;
    if (!chatMessages?.length) return <div className="p-8 text-gray-500">No messages found</div>;

    return (
        <>
            <ChatHeader currentChatId={chatId} />
            <div className="px-6 flex flex-col justify-center h-[90%]">
                <ChatMessages messages={messages} retryMap={retryMap} retryingId={retryingId} />

                <div className="mx-auto md:max-w-[80%] w-full">
                    <MessageInput chatId={chatId} setRetryMap={setRetryMap} setRetryingId={setRetryingId} />

                </div>
            </div>
        </>
    );
}
