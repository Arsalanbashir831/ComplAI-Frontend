// components/ChatBubble.tsx

import chatLoading from '@/assets/lottie/chat_loading_anime.json'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import type { Components } from 'react-markdown'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types/chat'
import { User } from '@/types/user'

import LottieAnimation from '../common/lottie-animation'
import { Button } from '../ui/button'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import CopyButton from './copy-button'
import { FileCard } from './file-card'

interface ChatBubbleProps {
  message: ChatMessage & { isError?: boolean }
  user?: User | null
}

interface CodeProps {
  inline?: boolean
  className?: string
  children?: React.ReactNode
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isBot = message.is_system_message
  const isError = !!message.isError
  const isStreaming = !!message.is_streaming

  const [showStream, setShowStream] = useState(false)
  const [finalContent, setFinalContent] = useState<string>('')

  useEffect(() => {
    if (!isStreaming && message.content) {
      setFinalContent(message.content)
    }
  }, [isStreaming, message.content])

  const files: Array<{ id?: number; file: string }> =
    Array.isArray(message.files) && message.files.length > 0
      ? (message.files as Array<{ id?: number; file: string }>)
      : typeof message.files === 'string'
      ? [{ file: message.files }]
      : []

  const markdownComponents: Components = {
    h1: (p) => <h1 className="mt-6 mb-4 text-3xl font-bold" {...p} />,
    h2: (p) => <h2 className="mt-5 mb-3 text-2xl font-bold" {...p} />,
    h3: (p) => <h3 className="mt-4 mb-2 text-xl font-semibold" {...p} />,
    hr: (p) => <hr className="my-4 border-t border-gray-300" {...p} />,
    p: (p) => <p className="mt-2 mb-2 text-lg leading-relaxed" {...p} />,
    ul: (p) => <ul className="ml-6 list-disc text-lg" {...p} />,
    ol: (p) => <ol className="ml-6 list-decimal text-lg" {...p} />,
    li: (p) => <li className="mb-1 text-lg" {...p} />,
    blockquote: (p) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...p} />
    ),
    code: ({ inline, className, children, ...p }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || '')
      return inline ? (
        <code className="bg-gray-100 p-1 rounded text-sm" {...p}>
          {children}
        </code>
      ) : (
        <pre className="bg-gray-100 p-4 my-4 overflow-auto rounded" {...p}>
          <code className={match ? `language-${match[1]}` : ''}>
            {children}
          </code>
        </pre>
      )
    },
    table: (p) => <table className="min-w-full border-collapse my-4" {...p} />,
    thead: (p) => <thead className="bg-blue-800" {...p} />,
    tbody: (p) => <tbody className="bg-white" {...p} />,
    tr: (p) => <tr className="border-b" {...p} />,
    th: (p) => <th className="px-4 py-2 text-white" {...p} />,
    td: (p) => <td className="px-4 py-2 text-black" {...p} />,
  }

  return (
    <div className={cn('flex mb-3', isBot ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          `flex flex-col gap-2 rounded-2xl py-2 ${
            isBot ? 'px-0 bg-white' : 'px-4 bg-blue-light text-white border-2'
          } md:max-w-[66.666667%]`
        )}
      >
        <div className="flex items-start gap-3">

          {/* BOT avatar + polished “Thinking…” header */}
          {isBot && isStreaming && (
  <div className="w-full">
    <div
      onClick={() => setShowStream(!showStream)}
      className="flex items-center justify-between bg-white rounded-t-lg px-4 py-2 cursor-pointer shadow-sm hover:bg-gray-200"
    >
      <div className="flex items-center space-x-2">
        <LottieAnimation
          animationData={chatLoading}
          style={{ width: 24, height: 24 }}
        />
        <span className="font-medium text-gray-700">Thinking…</span>
      </div>
      {showStream ? (
        <ChevronUp className="text-gray-600" size={20} />
      ) : (
        <ChevronDown className="text-gray-600" size={20} />
      )}
    </div>

    <AnimatePresence initial={false}>
      {showStream && (
        <motion.div
          key="thinking-panel"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 192 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-t-0 border-gray-200 rounded-b-lg p-4 overflow-hidden shadow-inner"
        >
          <div className="h-48 overflow-y-auto">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {message.content}
            </Markdown>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)}

          {/* Final message or error */}
          {!isStreaming && (
            <div className="flex flex-col gap-2 w-full">
              <div className={cn('text-justify', isError ? 'text-red-500 italic' : 'text-black')}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {finalContent}
                  </Markdown>
                </motion.div>
              </div>

              {/* File attachments */}
              {files.length > 0 && (
                <ScrollArea className="whitespace-nowrap flex w-full max-w-[600px]">
                  <div className="flex w-max h-14 gap-2">
                    {files.map((entry, idx) => (
                      <FileCard
                        key={entry.id ?? idx}
                        file={new File([entry.file], entry.file.split('/').pop() || 'file')}
                        showExtraInfo={false}
                        titleColor="text-gray-dark"
                        className="bg-gray-light h-10"
                        hasShareButton
                      />
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {!isError && (
                  <CopyButton content={finalContent} />
                )}
                {isError && (
                  <Button
                    onClick={() => window.location.reload()}
                    className="text-xs px-3 py-1 rounded-full text-white"
                  >
                    Refresh
                  </Button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
