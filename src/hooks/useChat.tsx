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

  const sendMessageMutation = useMutation({
    mutationFn: async ({
      chatId,
      content,
      documents,
      onChunkUpdate,
      signal,
    }: {
      chatId: string;
      content: string;
      documents?: File[] | Blob;
      onChunkUpdate?: (chunk: string) => void;
      signal?: AbortSignal;
    }): Promise<ChatMessage> => {
      const streamUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_ROUTES.CHAT.ADD_MESSAGE_STREAM(chatId)}`;

      // Prepare FormData for sending the message with optional file.
      const formData = new FormData();
      formData.append('content', content);
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

      return new Promise<ChatMessage>(async (resolve, reject) => {
        try {
          // Step 1: Send message and initiate streaming.
          const sendResponse = await fetch(streamUrl, {
            method: 'POST',
            body: formData,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              Accept: '*/*',
            },
            signal,
          });

          // if you get a 400, throw a special Error
          if (sendResponse.status === 400) {
            throw new Error('Network error');
          }

          if (!sendResponse.ok || !sendResponse.body) {
            const errorData = await sendResponse.json();
            throw new Error(errorData.error || 'Failed to send message');
          }

          // Step 2: Read the streaming response in chunks.
          const reader = sendResponse.body.getReader();
          let aiResponse = '';
          const decoder = new TextDecoder(); // Single decoder instance.
          let buffer = ''; // Buffer for incomplete JSON chunks
          const sleep = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));
          const readStream = async () => {
            try {
              while (true) {
                if (signal && signal.aborted) {
                  reject(new DOMException('Aborted', 'AbortError'));
                  break;
                }
                let result;
                try {
                  result = await reader.read();
                } catch (err) {
                  if (signal && signal.aborted) {
                    reject(new DOMException('Aborted', 'AbortError'));
                    break;
                  }
                  throw err;
                }
                if (signal && signal.aborted) {
                  reject(new DOMException('Aborted', 'AbortError'));
                  break;
                }
                const { done, value } = result;
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  if (!line.trim()) continue;
                  try {
                    const data = JSON.parse(line.trim());

                    // Append reasoning to the current response, preserving spaces and empty chunks
                    if (data?.reasoning !== undefined) {
                      aiResponse += data.reasoning;
                      if (onChunkUpdate) {
                        await sleep(0);
                        onChunkUpdate(aiResponse);
                      }
                    }

                    // If an error chunk is received, update the message with the error
                    if (data?.error) {
                      if (onChunkUpdate) {
                        onChunkUpdate(''); // Clear any partial content
                      }
                      // Instead of resolving, reject with a special error object
                      reject({
                        isStreamError: true,
                        errorChunk: data.error,
                      });
                      return;
                    }

                    // If a summary is received, resolve the promise.
                    if (data?.summary) {
                      const finalMessage: ChatMessage = {
                        id: data.summary.id,
                        chat: data.summary.chat,
                        user: data.summary.user,
                        content: aiResponse.trim(),
                        created_at: data.summary.created_at,
                        tokens_used: data.summary.tokens_used,
                        is_system_message: true,
                        files: null,
                      };
                      resolve(finalMessage);
                    }
                  } catch (error) {
                    console.error('Error parsing JSON chunk:', error);
                  }
                }
              }
            } finally {
              try {
                reader.cancel();
              } catch {}
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
