import { API_ROUTES } from '@/constants/apiRoutes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import apiCaller from '@/config/apiCaller';
import type { Chat, ChatMessage } from '@/types/chat';

type MutationVars = {
  chatId: string;
  content: string;
  documents?: File[] | Blob;
  onChunkUpdate?: (chunk: string, done: boolean) => void;
  signal?: AbortSignal;
};
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

const searchUserChats = async (searchTerm: string): Promise<Chat[]> => {
  const response = await apiCaller(
    `${API_ROUTES.CHAT.SEARCH_CHATS(searchTerm)}`,
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
        newChat,
        ...oldChats,
      ]);
    },
  });

  const addMessageMutation = useMutation({
    mutationFn: async ({
      chatId,
      content,
      documents,
      return_type,
      signal,
    }: {
      chatId: string;
      content: string;
      documents?: File[] | Blob;
      return_type?: 'docx' | 'pdf' | null;
      signal?: AbortSignal;
    }): Promise<ChatMessage> => {
      try {
        // Create FormData
        const formData = new FormData();
        formData.append('content', content);

        // Append document only if it exists
        if (documents) {
          if (Array.isArray(documents)) {
            documents.forEach((file, index) => {
              console.log(
                ` - Appending file ${index + 1}: ${file.name} with key 'document'`
              );
              // Use the key 'document' as required by backend
              formData.append('document', file, file.name);
            });
          } else {
            // Handle single Blob
            formData.append('document', documents);
          }
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
            signal,
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
            const match = disposition.match(
              /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
            );
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
            content: 'Here is the File you requested against your prompt',
            created_at: new Date().toISOString(),
            tokens_used: 0,
            is_system_message: true,
            files: fileObject,
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

   function useSendMessageMutation() {
    const queryClient = useQueryClient();
  
    return useMutation<ChatMessage, Error, MutationVars>({
      mutationFn: async ({ chatId, content, documents, onChunkUpdate, signal }) => {
        const streamUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_ROUTES.CHAT.ADD_MESSAGE_STREAM(chatId)}`;
  
        // Build form data
        const formData = new FormData();
        formData.append('content', content);
        if (documents) {
          if (Array.isArray(documents)) {
            documents.forEach((file) => formData.append('document', file, file.name));
          } else {
            formData.append('document', documents);
          }
        }
  
        return new Promise<ChatMessage>(async (resolve, reject) => {
          try {
            const response = await fetch(streamUrl, {
              method: 'POST',
              body: formData,
              headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                Accept: '*/*',
              },
              signal,
            });
  
            if (response.status === 400) {
              throw new Error('Network error');
            }
            if (!response.ok || !response.body) {
              const err = await response.json();
              throw new Error(err.error || 'Failed to send message');
            }
  
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let aiResponse = '';
            let buffer = '';
  
            // Read chunks until the stream ends:
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
  
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';
  
              for (const line of lines) {
                if (!line.trim()) continue;
  
                let data: { reasoning?: string; summary?: ChatMessage };
                try {
                  data = JSON.parse(line.trim());
                } catch (e) {
                  console.error('Error parsing JSON chunk:', e);
                  continue;
                }
  
                if (data.reasoning) {
                  aiResponse += data.reasoning;
                  onChunkUpdate?.(aiResponse, false); // still streaming
                }
  
                if (data.summary) {
                  // final message arrived
                  onChunkUpdate?.(aiResponse, true);
  
                  const finalMessage: ChatMessage = {
                    id: data.summary.id,
                    chat: data.summary.chat,
                    user: data.summary.user,
                    content: aiResponse,
                    created_at: data.summary.created_at,
                    tokens_used: data.summary.tokens_used,
                    is_system_message: true,
                    is_streaming: false,
                    files: null,
                  };
                  resolve(finalMessage);
                  return;
                }
              }
            }
  
            // If we exit the loop without a summary, resolve a fallback message
            resolve({
              id: Date.now(),
              chat: Number(chatId),
              user: 'AI',
              content: aiResponse,
              created_at: new Date().toISOString(),
              tokens_used: 0,
              is_system_message: true,
              is_streaming: false,
              files: null,
            });
          } catch (err: unknown) {
            console.error('Error in sendMessage stream:', err);
            reject(err);
          }
        });
      },
  
      onSuccess: (_newMsg, { chatId }) => {
        // Refetch the chat’s messages so your UI updates cleanly
        queryClient.invalidateQueries({ queryKey: ['chatMessages', chatId] });
      },
    });
  }
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
    sendMessage: useSendMessageMutation().mutateAsync,
    deleteChat: deleteChatMutation.mutateAsync,
    addMessageNoStream: addMessageMutation.mutateAsync,
    searchChats: searchUserChats,
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

