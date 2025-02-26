import { API_ROUTES } from '@/constants/apiRoutes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import apiCaller from '@/config/apiCaller';
import type { Chat, ChatMessage } from '@/types/chat';

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
    }: {
      chatId: string;
      content: string;
      document?: File | Blob;
    }): Promise<ChatMessage> => {
      // Build payload with optional document
      const payload: Record<string, string | File | Blob> = { content };
      if (document) {
        payload.document = document;
      }
      // Send the message using the non-streaming endpoint.
      const endpoint = API_ROUTES.CHAT.ADD_MESSAGE(chatId);
      const sendResponse = await apiCaller(
        endpoint,
        'POST',
        payload,
        {},
        true,
        'formdata'
      );
      if (!sendResponse) {
        throw new Error('Failed to send message');
      }

      return sendResponse.data;

      // Open an EventSource for the streaming response.

      // const streamUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_ROUTES.CHAT.ADD_MESSAGE_STREAM(chatId)}`;
      // return new Promise<ChatMessage>((resolve, reject) => {
      //   const eventSource = new EventSource(streamUrl);
      //   let aiResponse = '';
      //   eventSource.onmessage = (event) => {
      //     try {
      //       const data = JSON.parse(event.data);
      //       if (data.chunk) {
      //         aiResponse += data.chunk;
      //       }
      //     } catch (err) {
      //       console.error('Error parsing event data', err);
      //     }
      //   };
      //   eventSource.onerror = (err: Event) => {
      //     console.error('Error in streaming', err);
      //     eventSource.close();
      //     reject(new Error('Error in streaming'));
      //   };
      //   // Listen for a custom "done" event indicating the stream is complete.
      //   eventSource.addEventListener('done', () => {
      //     eventSource.close();
      //     // Construct the final ChatMessage.
      //     const finalMessage: ChatMessage = {
      //       id: Date.now(), // Replace with a proper unique ID if available.
      //       chat: Number(chatId),
      //       user: null,
      //       content: aiResponse,
      //       created_at: new Date().toISOString(),
      //       is_system_message: false,
      //       file: null,
      //     };
      //     resolve(finalMessage);
      //   });
      // });
    },
    onSuccess: (_, variables) => {
      // Invalidate chat messages query to force refetch of updated messages.
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

