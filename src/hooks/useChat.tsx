import { API_ROUTES } from '@/constants/apiRoutes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import apiCaller from '@/config/apiCaller';
import type { AuthorityValue, Chat, ChatMessage, Citation } from '@/types/chat';

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
    staleTime: 0, // Always consider data stale to allow immediate refetch
    retry: 1,
  });

  // Mutation: Create new chat
  const createChatMutation = useMutation({
    mutationFn: async ({
      name,
      chat_category,
    }: {
      name: string;
      chat_category: AuthorityValue;
    }): Promise<Chat> => {
      const response = await apiCaller(
        API_ROUTES.CHAT.CREATE,
        'POST',
        { name, chat_category: chat_category || '' },
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
        const updatedChats = [newChat, ...chatsArray];
        return updatedChats;
      });
      // Invalidate to ensure server sync
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  const addMessageMutation = useMutation({
    mutationFn: async ({
      chatId,
      content,
      documents,
      return_type,
      systemPromptCategory,
      signal,
    }: {
      chatId: string;
      content: string;
      documents?: File[] | Blob;
      return_type?: 'docx' | 'pdf' | null;
      systemPromptCategory: AuthorityValue;
      signal?: AbortSignal;
    }): Promise<ChatMessage> => {
      try {
        // Create FormData
        const formData = new FormData();
        formData.append('content', content);
        formData.append('stream', 'true');
        formData.append('system_prompt_category', systemPromptCategory || '');

        // Append document only if it exists
        if (documents) {
          if (Array.isArray(documents)) {
            documents.forEach((file) => {
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
          let errorData: { error?: string };
          try {
            errorData = await response.json();
          } catch {
            errorData = { error: 'Unknown error occurred' };
          }

          // Create error with backend error message and status info
          const error = new Error(
            errorData.error || 'Failed to send message'
          ) as Error & {
            status?: number;
            retryable?: boolean;
          };
          error.status = response.status;

          // Determine retryability based on status code
          // 400 and 403 are not retryable, 500 and 503 are retryable
          if (response.status === 400 || response.status === 403) {
            error.retryable = false;
          } else if (response.status === 500 || response.status === 503) {
            error.retryable = true;
          }

          throw error;
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
      systemPromptCategory,
      signal,
      onChunkUpdate,
    }: {
      chatId: string;
      content: string;
      documents?: File[] | Blob;
      systemPromptCategory: AuthorityValue;
      signal?: AbortSignal;
      onChunkUpdate?: (chunk: {
        reasoning: string;
        content: string;
        done?: boolean;
      }) => void;
    }): Promise<ChatMessage> => {
      const streamUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_ROUTES.CHAT.ADD_MESSAGE_STREAM(chatId)}`;

      const formData = new FormData();
      formData.append('content', content);
      formData.append('stream', 'true');
      formData.append('system_prompt_category', systemPromptCategory || '');
      if (documents) {
        if (Array.isArray(documents)) {
          documents.forEach((file) => {
            formData.append('document', file, file.name);
          });
        } else {
          formData.append('document', documents);
        }
      }

      return new Promise<ChatMessage>(async (resolve, reject) => {
        try {
          const sendResponse = await fetch(streamUrl, {
            method: 'POST',
            body: formData,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              Accept: '*/*',
            },
            signal,
          });

          if (!sendResponse.ok) {
            let errorData: { error?: string };
            try {
              errorData = await sendResponse.json();
            } catch {
              errorData = { error: 'Unknown error occurred' };
            }

            // Create error with backend error message and status info
            const error = new Error(
              errorData.error || 'Failed to send message'
            ) as Error & {
              status?: number;
              retryable?: boolean;
            };
            error.status = sendResponse.status;

            // Determine retryability based on status code
            if (sendResponse.status === 400 || sendResponse.status === 403) {
              error.retryable = false;
            } else if (
              sendResponse.status === 500 ||
              sendResponse.status === 503
            ) {
              error.retryable = true;
            }

            throw error;
          }

          const reader = sendResponse.body?.getReader();
          if (!reader) throw new Error('No response body');

          const decoder = new TextDecoder();

          // running aggregates
          let fullReasoning = '';
          let fullContent = '';

          // used for final ChatMessage
          let finalMessage: ChatMessage | null = null;
          let hasReceivedContent = false;
          let chunksReceived = 0;

          // streaming buffer for SSE lines
          let buffer = '';

          // Emit updates only for reasoning changes and final content
          const emitUpdate = (done = false) => {
            if (!onChunkUpdate) return;

            if (done) {
              // Only emit final content when done
              onChunkUpdate({
                reasoning: fullReasoning,
                content: fullContent,
                done: true,
              });
            } else {
              // Only emit reasoning updates during streaming
              onChunkUpdate({
                reasoning: fullReasoning,
                content: '', // Don't send content during streaming
                done: false,
              });
            }
          };

          while (true) {
            // Check if request was aborted
            if (signal?.aborted) {
              throw new DOMException('Aborted', 'AbortError');
            }

            const { done, value } = await reader.read();
            if (done) break;

            const chunkText = decoder.decode(value, { stream: true });
            buffer += chunkText;

            // split by newline because server is using Server-Sent Events style:
            // data: {...}\n\n
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // keep last partial line in buffer

            for (const line of lines) {
              // Check if request was aborted during processing
              if (signal?.aborted) {
                throw new DOMException('Aborted', 'AbortError');
              }

              const trimmed = line.trim();
              if (!line.trim() || !line.startsWith('data: ')) {
                continue; // Skip empty lines, comments, or non-data lines
              }
              // if (!trimmed.startsWith('data:')) continue;

              // strip "data: "
              const jsonString = trimmed.substring(6).trim();
              if (!jsonString) continue; // Skip if it was just "data: "

              let dataObj: {
                reasoning?: string;
                content?: string;
                done?: boolean;
                message_id?: string;
                ai_message_id?: string;
                tokens_used?: number;
                citations?: unknown;
                error?: string;
                thought_summary?: string;
              };
              try {
                dataObj = JSON.parse(jsonString);
                chunksReceived++; // Track chunks received
              } catch {
                // if partial JSON leaked into this line, skip
                // next iteration will complete it
                continue;
              }

              // Handle error chunks from backend (backend sends errors with done=true)
              if (dataObj.error && dataObj.done) {
                const error = new Error(dataObj.error) as Error & {
                  retryable?: boolean;
                };
                // Errors from backend are generally retryable unless they're validation errors
                error.retryable =
                  !dataObj.error.toLowerCase().includes('invalid') &&
                  !dataObj.error.toLowerCase().includes('permission');
                reject(error);
                return;
              }

              // append reasoning/content aggregates
              if (dataObj.reasoning) {
                // If this is the final chunk with done=true, use the complete reasoning
                // Otherwise, accumulate reasoning for streaming
                if (dataObj.done) {
                  fullReasoning = dataObj.reasoning; // Use complete reasoning from final chunk
                } else {
                  fullReasoning += dataObj.reasoning; // Accumulate for streaming
                }
              }

              if (dataObj.content) {
                // If this is the final chunk with done=true, use the complete content
                // Otherwise, accumulate content for streaming
                if (dataObj.done) {
                  fullContent = dataObj.content; // Use complete content from final chunk
                } else {
                  fullContent += dataObj.content; // Accumulate for streaming
                }
                hasReceivedContent = true;
              }

              // Only emit reasoning updates during streaming
              if (dataObj.reasoning !== undefined) {
                emitUpdate(false);
              }

              // finalise if done
              if (dataObj.done) {
                // Check for empty response scenario
                if (!fullContent || fullContent.trim().length === 0) {
                  const error = new Error(
                    'No response generated from AI service'
                  ) as Error & {
                    retryable?: boolean;
                  };
                  error.retryable = true;
                  reject(error);
                  return;
                }

                // always emit final full text for UI with done=true
                emitUpdate(true);

                // Use thought_summary from backend if available, otherwise use accumulated reasoning
                const finalReasoning = dataObj.thought_summary || fullReasoning;

                finalMessage = {
                  id: dataObj.ai_message_id || dataObj.message_id || Date.now(),
                  chat: Number(chatId),
                  user: 'AI',
                  content: fullContent,
                  created_at: new Date().toISOString(),
                  tokens_used: dataObj.tokens_used || 0,
                  is_system_message: true,
                  files: null,
                  citations: dataObj.citations as string | Citation | undefined,
                  reasoning: finalReasoning,
                };
              }
            }
          }

          // after stream ends ensure we processed any remaining buffered line
          if (buffer.trim().startsWith('data:')) {
            try {
              const lastJson = JSON.parse(buffer.trim().slice(5).trim());
              if (lastJson.reasoning) {
                // If this is the final chunk with done=true, use the complete reasoning
                if (lastJson.done) {
                  fullReasoning = lastJson.reasoning; // Use complete reasoning from final chunk
                } else {
                  fullReasoning += lastJson.reasoning; // Accumulate for streaming
                }
              }
              if (lastJson.content) {
                // If this is the final chunk with done=true, use the complete content
                if (lastJson.done) {
                  fullContent = lastJson.content; // Use complete content from final chunk
                } else {
                  fullContent += lastJson.content; // Accumulate for streaming
                }
                hasReceivedContent = true;
              }
              emitUpdate(!!lastJson.done);
              if (lastJson.done && !finalMessage) {
                // Use thought_summary from backend if available, otherwise use accumulated reasoning
                const finalReasoning =
                  (lastJson as { thought_summary?: string }).thought_summary ||
                  fullReasoning;

                finalMessage = {
                  id:
                    (lastJson as { ai_message_id?: string }).ai_message_id ||
                    lastJson.message_id ||
                    Date.now(),
                  chat: Number(chatId),
                  user: 'AI',
                  content: fullContent,
                  created_at: new Date().toISOString(),
                  tokens_used: lastJson.tokens_used || 0,
                  is_system_message: true,
                  files: null,
                  citations: lastJson.citations as
                    | string
                    | Citation
                    | undefined,
                  reasoning: finalReasoning,
                };
              }
            } catch {
              // ignore trailing junk
            }
          }

          // Check for no chunks received scenario
          if (chunksReceived === 0) {
            const error = new Error(
              'No response received from the server. Please try again.'
            ) as Error & {
              retryable?: boolean;
            };
            error.retryable = true;
            reject(error);
            return;
          }

          // fallback if stream ended without explicit done
          if (!finalMessage) {
            // Check if we received chunks but no content
            if (chunksReceived > 0 && !hasReceivedContent) {
              const error = new Error(
                'Stream ended without generating content. Please try again.'
              ) as Error & {
                retryable?: boolean;
              };
              error.retryable = true;
              reject(error);
              return;
            }

            finalMessage = {
              id: Date.now(),
              chat: Number(chatId),
              user: 'AI',
              content: hasReceivedContent
                ? fullContent
                : 'No response received',
              created_at: new Date().toISOString(),
              tokens_used: 0,
              is_system_message: true,
              files: null,
              citations: undefined,
              reasoning: fullReasoning,
            };
            // emit final accumulated state
            emitUpdate(true);
          }

          reader.releaseLock();
          resolve(finalMessage);
        } catch (err) {
          reject(err);
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
        API_ROUTES.CHAT.DELETE(chatId),
        'DELETE',
        {},
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
  next_cursor?: string | null;
}

interface PaginatedMessagesResponse {
  results: ChatMessage[];
  pagination: PaginationMetadata;
}

// Hook to fetch individual chat data by ID
const useChatById = (chatId: string) => {
  const queryClient = useQueryClient();

  return useQuery<Chat, Error>({
    queryKey: ['chat', chatId],
    queryFn: async (): Promise<Chat> => {
      // First try to get from the cached chats list
      const cachedChats = queryClient.getQueryData<Chat[]>(['chats']);
      if (cachedChats) {
        const foundChat = cachedChats.find(
          (chat: Chat) => String(chat.id) === chatId
        );
        if (foundChat) {
          return foundChat;
        }
      }

      // If not found in cache, fetch from API
      const response = await apiCaller(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chats/user/`,
        'GET',
        {},
        {},
        true,
        'json'
      );

      const chats = response.data?.results || response.data || [];
      const foundChat = chats.find((chat: Chat) => String(chat.id) === chatId);

      if (foundChat) {
        return foundChat;
      }

      throw new Error('Chat not found');
    },
    enabled: !!chatId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

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

export { useChat, useChatById, useChatMessages };
