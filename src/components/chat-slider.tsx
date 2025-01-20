'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string | React.ReactNode;
}

interface ChatSlide {
  messages: ChatMessage[];
}

interface ChatSliderProps {
  slides: ChatSlide[];
}

export function ChatSlider({ slides }: ChatSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="space-y-4">
      <Card className="p-6 shadow-lg">
        <div className="space-y-4">
          {slides[currentSlide].messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'rounded-lg bg-white p-4 shadow-sm',
                message.role === 'assistant' && 'space-y-4'
              )}
            >
              {typeof message.content === 'string' ? (
                <p
                  className={
                    message.role === 'user' ? 'text-lg font-medium' : ''
                  }
                >
                  {message.content}
                </p>
              ) : (
                message.content
              )}
            </div>
          ))}
        </div>
      </Card>
      <div className="relative">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <p className="text-gray-500">Message Compl-AI</p>
            <Button variant="ghost" size="icon" className="ml-auto">
              <Upload className="h-4 w-4" />
              <span className="sr-only">Upload files</span>
            </Button>
          </div>
        </Card>
      </div>
      <div className="flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={cn(
              'h-2 w-2 rounded-full',
              currentSlide === index ? 'bg-blue-600' : 'bg-gray-300'
            )}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
