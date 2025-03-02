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

  const addMessageMutation = useMutation({
    mutationFn: async ({
      chatId,
      content,
      document,
      return_type,
    }: {
      chatId: string;
      content: string;
      document?: File | Blob;
      return_type?: 'docx' | 'pdf' | null;
    }): Promise<ChatMessage> => {
      try {
        // Create FormData
        const formData = new FormData();
        formData.append('content', content);
  
        // Append document only if it exists
        if (document) {
          formData.append('document', document);
        }
  
        // Append return_type only if it exists
        if (return_type) {
          formData.append('return_type', return_type);
        }
  
        // Send API request using fetch
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_ROUTES.CHAT.ADD_MESSAGE(chatId)}`,
          {
            method: 'POST',
            body: formData,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
  
        // Handle non-OK responses
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send message');
        }
  
        // Check the content-type to decide how to process the response.
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          // If JSON, parse and return it as ChatMessage.
          const responseData = await response.json();
          return responseData as ChatMessage;
        } else {
          // Assume binary response.
          const blob = await response.blob();
          const disposition = response.headers.get('Content-Disposition');
          let fileName = 'download';
          if (disposition && disposition.includes('filename=')) {
            const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (match && match[1]) {
              fileName = match[1].replace(/['"]/g, '');
            }
          }
          // Create a File object from the blob.
          const fileObject = new File([blob], fileName, {
            type: blob.type || 'application/octet-stream',
          });
          // Build a ChatMessage object with the file attached.
          return {
            id: Date.now(),
            chat: Number(chatId),
            user: 'AI',
            content: 'File received',
            created_at: new Date().toISOString(),
            tokens_used: 0,
            is_system_message: true,
            file: fileObject,
          } as ChatMessage;
        }
      } catch (error) {
        console.error('Error adding message to chat:', error);
        throw error;
      }
    },
    onSuccess: (newMessage, variables) => {
      const { chatId } = variables;
  
      // Update the chat messages cache immediately.
      queryClient.setQueryData<ChatMessage[]>(
        ['chatMessages', chatId],
        (oldMessages = []) => [...oldMessages, newMessage]
      );
  
      // Invalidate the query to ensure fresh data from the server.
      queryClient.invalidateQueries({ queryKey: ['chatMessages', chatId] });
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
    addMessageNoStream: addMessageMutation.mutateAsync,
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

