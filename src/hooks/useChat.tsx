import { API_ROUTES } from '@/constants/apiRoutes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import apiCaller from '@/config/apiCaller';
import type { Chat, ChatMessage } from '@/types/chat';

// Types for paginated chats response
interface PaginatedChatsResponse {
  results: Chat[];
  pagination: {
    page_size: number;
    direction: 'asc' | 'desc';
    has_next: boolean;
    count: number;
  };
}

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
  
  // Handle both paginated and non-paginated responses
  if (response.data && 'results' in response.data) {
    return (response.data as PaginatedChatsResponse).results;
  }
  
  // Fallback for non-paginated response
  return Array.isArray(response.data) ? response.data : [];
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
      queryClient.setQueryData<Chat[]>(['chats'], (oldChats = []) => {
        // Ensure oldChats is an array
        const chatsArray = Array.isArray(oldChats) ? oldChats : [];
        return [newChat, ...chatsArray];
      });
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

          // Parse citations if present
          if (responseData.citations) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parseCitations = (citationsData: any) => {
              if (!citationsData) return undefined;

              try {
                // Handle nested array format from Google Gemini
                if (Array.isArray(citationsData) && citationsData.length > 0) {
                  const candidateData = citationsData[0];
                  if (!Array.isArray(candidateData)) return undefined;

                  const groundingMetadataEntry = candidateData.find(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (item: any) =>
                      Array.isArray(item) && item[0] === 'grounding_metadata'
                  );

                  if (
                    !groundingMetadataEntry ||
                    !Array.isArray(groundingMetadataEntry[1])
                  )
                    return undefined;

                  const groundingMetadata = groundingMetadataEntry[1];

                  const groundingChunksEntry = groundingMetadata.find(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (item: any) =>
                      Array.isArray(item) && item[0] === 'grounding_chunks'
                  );

                  if (
                    !groundingChunksEntry ||
                    !Array.isArray(groundingChunksEntry[1])
                  )
                    return undefined;

                  const groundingChunks = groundingChunksEntry[1];

                  const sources = groundingChunks
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map((chunk: any, index: number) => {
                      if (!Array.isArray(chunk) || !Array.isArray(chunk[0]))
                        return null;

                      const webEntry = chunk[0].find(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (item: any) => Array.isArray(item) && item[0] === 'web'
                      );

                      if (!webEntry || !Array.isArray(webEntry[1])) return null;

                      const webData = webEntry[1];

                      const titleEntry = webData.find(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (item: any) =>
                          Array.isArray(item) && item[0] === 'title'
                      );
                      const uriEntry = webData.find(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (item: any) => Array.isArray(item) && item[0] === 'uri'
                      );

                      const title = titleEntry?.[1] || 'Unknown Source';
                      const uri = uriEntry?.[1] || '';

                      if (!uri) return null;

                      return {
                        id: `source_${index}`,
                        title: title,
                        publisher: title,
                        url_hint: uri,
                      };
                    })
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .filter((source: any) => source !== null);

                  return sources.length > 0 ? { sources } : undefined;
                }

                if (
                  typeof citationsData === 'object' &&
                  citationsData.sources
                ) {
                  return citationsData;
                }

                if (typeof citationsData === 'string') {
                  return citationsData;
                }

                return undefined;
              } catch (error) {
                console.error('Error parsing citations:', error);
                return undefined;
              }
            };

            responseData.citations = parseCitations(responseData.citations);
          }

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
            citations: undefined,
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
      signal,
    }: {
      chatId: string;
      content: string;
      documents?: File[] | Blob;
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
          // Send message and get response
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

          if (!sendResponse.ok) {
            const errorData = await sendResponse.json();
            throw new Error(errorData.error || 'Failed to send message');
          }

          // Parse the complete response
          const responseData = await sendResponse.json();

          // Helper function to parse nested array citations from Google Gemini format
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const parseCitations = (citationsData: any) => {
            if (!citationsData) return undefined;

            try {
              // Handle nested array format from Google Gemini
              if (Array.isArray(citationsData) && citationsData.length > 0) {
                // Navigate to grounding_metadata: citations[0][6][1]
                const candidateData = citationsData[0];
                if (!Array.isArray(candidateData)) return undefined;

                // Find the grounding_metadata array (index 6 in the structure)
                const groundingMetadataEntry = candidateData.find(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (item: any) =>
                    Array.isArray(item) && item[0] === 'grounding_metadata'
                );

                if (
                  !groundingMetadataEntry ||
                  !Array.isArray(groundingMetadataEntry[1])
                )
                  return undefined;

                const groundingMetadata = groundingMetadataEntry[1];

                // Find grounding_chunks within grounding_metadata
                const groundingChunksEntry = groundingMetadata.find(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (item: any) =>
                    Array.isArray(item) && item[0] === 'grounding_chunks'
                );

                if (
                  !groundingChunksEntry ||
                  !Array.isArray(groundingChunksEntry[1])
                )
                  return undefined;

                const groundingChunks = groundingChunksEntry[1];

                // Extract web sources from each chunk
                const sources = groundingChunks
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .map((chunk: any, index: number) => {
                    if (!Array.isArray(chunk) || !Array.isArray(chunk[0]))
                      return null;

                    // Find the 'web' entry in the chunk
                    const webEntry = chunk[0].find(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (item: any) => Array.isArray(item) && item[0] === 'web'
                    );

                    if (!webEntry || !Array.isArray(webEntry[1])) return null;

                    const webData = webEntry[1];

                    // Extract title and uri from webData
                    const titleEntry = webData.find(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (item: any) => Array.isArray(item) && item[0] === 'title'
                    );
                    const uriEntry = webData.find(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (item: any) => Array.isArray(item) && item[0] === 'uri'
                    );

                    const title = titleEntry?.[1] || 'Unknown Source';
                    const uri = uriEntry?.[1] || '';

                    if (!uri) return null;

                    return {
                      id: `source_${index}`,
                      title: title,
                      publisher: title,
                      url_hint: uri,
                    };
                  })
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .filter((source: any) => source !== null);

                return sources.length > 0 ? { sources } : undefined;
              }

              // Handle structured object format
              if (typeof citationsData === 'object' && citationsData.sources) {
                return citationsData;
              }

              // Handle string format
              if (typeof citationsData === 'string') {
                return citationsData;
              }

              return undefined;
            } catch (error) {
              console.error('Error parsing citations:', error);
              return undefined;
            }
          };

          // Handle the new response format with ai_response
          if (responseData?.summary) {
            const finalMessage: ChatMessage = {
              id: responseData.summary.id,
              chat: responseData.summary.chat,
              user: responseData.summary.user,
              content:
                responseData.summary.ai_response ||
                responseData.summary.content,
              created_at: responseData.summary.created_at,
              tokens_used: responseData.summary.tokens_used || 0,
              is_system_message: true,
              files: null,
              citations: parseCitations(responseData.citations),
            };
            resolve(finalMessage);
          } else {
            throw new Error('Invalid response format from server');
          }
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

// Types for paginated response
interface PaginationMetadata {
  page_size: number;
  direction: 'asc' | 'desc';
  has_next: boolean;
  count: number;
}

interface PaginatedMessagesResponse {
  results: ChatMessage[];
  pagination: PaginationMetadata;
}

// Hook to fetch messages for a specific chat with pagination
const useChatMessages = (chatId: string) => {
  return useQuery<PaginatedMessagesResponse, Error>({
    queryKey: ['chatMessages', chatId],
    queryFn: async (): Promise<PaginatedMessagesResponse> => {
      const response = await apiCaller(
        API_ROUTES.CHAT.GET_MESSAGES(chatId),
        'GET',
        {},
        {},
        true,
        'json'
      );
      // Handle both paginated and non-paginated responses
      if (response.data && 'results' in response.data) {
        return response.data as PaginatedMessagesResponse;
      }
      // Fallback for non-paginated response
      return {
        results: Array.isArray(response.data) ? response.data : [],
        pagination: {
          page_size: 50,
          direction: 'asc',
          has_next: false,
          count: Array.isArray(response.data) ? response.data.length : 0,
        },
      };
    },
    enabled: !!chatId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export { useChat, useChatMessages };

