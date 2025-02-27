import { API_ROUTES } from '@/constants/apiRoutes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Chat, ChatMessage } from '@/types/chat';
import apiCaller from '@/config/apiCaller';

// Fetch all user chats
const fetchUserChats = async (): Promise<Chat[]> => {
  const response = await apiCaller(
    API_ROUTES.CHAT.GET_USER_CHATS,
    'GET',
    {},
    {},
    true,
    'json'
  );
  return response.data;
};

const useChat = () => {
  const queryClient = useQueryClient();

  // Fetch chats
  const {
    data: chats,
    error,
    isLoading,
  } = useQuery<Chat[], Error>({
    queryKey: ['chats'],
    queryFn: fetchUserChats,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Mutation: Create new chat
  const createChatMutation = useMutation({
    mutationFn: async (name: string): Promise<Chat> => {
      const response = await apiCaller(
        API_ROUTES.CHAT.CREATE,
        'POST',
        { name },
        {},
        true,
        'json'
      );
      return response.data;
    },
    onSuccess: (newChat) => {
      queryClient.setQueryData<Chat[]>(['chats'], (oldChats = []) => [
        ...oldChats,
        newChat,
      ]);
    },
  });

  /**
   * Unified mutation to send a message.
   *
   * @param params.chatId - The chat's ID.
   * @param params.content - The message content.
   * @param params.document - Optional File or Blob attachment.
   */
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      chatId,
      content,
      document,
      onChunkUpdate, // ✅ Callback function to update UI in real-time
    }: {
      chatId: string;
      content: string;
      document?: File | Blob;
      onChunkUpdate?: (chunk: string) => void;
    }): Promise<ChatMessage> => {
      const streamUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_ROUTES.CHAT.ADD_MESSAGE_STREAM(chatId)}`;

      // Prepare FormData for sending the message with optional file
      const formData = new FormData();
      formData.append('content', content);
      if (document) {
        formData.append('document', document);
      }

      return new Promise<ChatMessage>(async (resolve, reject) => {
        try {
          // ✅ Step 1: Send message and initiate streaming
          const sendResponse = await fetch(streamUrl, {
            method: 'POST',
            body: formData,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              Accept: '*/*', // ✅ Ensures correct streaming format
            },
          });

          if (!sendResponse.ok || !sendResponse.body) {
            const errorData = await sendResponse.json();
            throw new Error(errorData.error || 'Failed to send message');
          }

          // ✅ Step 2: Read the streaming response in chunks
          const reader = sendResponse.body.getReader();
          let aiResponse = '';

          const readStream = async () => {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              // Convert the chunk to string
              const textChunk = new TextDecoder().decode(value);
              try {
                const jsonChunks = textChunk.split('\n').filter(Boolean);
                jsonChunks.forEach((chunk) => {
                  const data = JSON.parse(chunk.trim());

                  // ✅ Live update UI with each chunk
                  if (data.chunk && data.chunk.trim() !== '') {
                    aiResponse += data.chunk;
                    if (onChunkUpdate) {
                      onChunkUpdate(aiResponse); // ✅ Live UI update callback
                    }
                  }

                  // ✅ If summary is received, finalize and resolve
                  if (data.summary) {
                    const finalMessage: ChatMessage = {
                      id: data.summary.id,
                      chat: data.summary.chat,
                      user: data.summary.user,
                      content: aiResponse.trim(),
                      created_at: data.summary.created_at,
                      tokens_used: data.summary.tokens_used,
                      is_system_message: true,
                      file: null,
                    };
                    resolve(finalMessage);
                  }
                });
              } catch (error) {
                console.error('Error parsing streaming response:', error);
              }
            }
          };

          await readStream();
        } catch (error) {
          console.error('Error sending message:', error);
          reject(error);
        }
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['chatMessages', variables.chatId],
      });
    },
  });

  // Mutation: Delete chat
  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: string): Promise<void> => {
      const response = await apiCaller(
        API_ROUTES.CHAT.DELETE,
        'POST',
        { chat_id: chatId },
        {},
        true,
        'json'
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the chat list query to update the chat list.
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  return {
    chats,
    isLoading,
    error,
    createChat: createChatMutation.mutateAsync,
    sendMessage: sendMessageMutation.mutateAsync,
    deleteChat: deleteChatMutation.mutateAsync,
  };
};

// Hook to fetch messages for a specific chat
const useChatMessages = (chatId: string) => {
  return useQuery<ChatMessage[], Error>({
    queryKey: ['chatMessages', chatId],
    queryFn: async (): Promise<ChatMessage[]> => {
      const response = await apiCaller(
        API_ROUTES.CHAT.GET_MESSAGES(chatId),
        'GET',
        {},
        {},
        true,
        'json'
      );
      return response.data;
    },
    enabled: !!chatId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export { useChat, useChatMessages };
