'use client';

import * as React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

interface Answer {
  src: string;
  alt: string;
  height: string;
  top?: string;
}

interface Slide {
  question: string;
  answers: Answer[];
  height: string;
}

const slides: Slide[] = [
  {
    question: '/auth-slider/q1.svg',
    answers: [
      { src: '/auth-slider/a1-a.svg', alt: 'Answer-1', height: 'h-14' },
      {
        src: '/auth-slider/a1-b.svg',
        alt: 'Answer-2',
        height: 'h-60',
        top: '-top-8',
      },
    ],
    height: 'h-16',
  },
  {
    question: '/auth-slider/q2.svg',
    answers: [
      { src: '/auth-slider/a2-a.svg', alt: 'Answer-1', height: 'h-14' },
      {
        src: '/auth-slider/a2-b.svg',
        alt: 'Answer-2',
        height: 'h-60',
        top: '-top-8',
      },
    ],
    height: 'h-24',
  },
  {
    question: '/auth-slider/q3.svg',
    answers: [
      { src: '', alt: '', height: '' },
      {
        src: '/auth-slider/a3.svg',
        alt: 'Answer-1',
        height: 'h-40',
        top: 'top-0',
      },
    ],
    height: 'h-20',
  },
];

export function AuthSlider() {
  const [currentSlideNo, setCurrentSlideNo] = React.useState(0);
  const currentSlide = slides[currentSlideNo];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlideNo((prevSlide) => (prevSlide + 1) % slides.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 py-8 h-full flex flex-col justify-center bg-white rounded-2xl">
      {/* Question Card */}

      <div className={`relative w-full ${currentSlide.height} right-10`}>
        <Image
          src={currentSlide.question}
          alt="Question"
          fill
          className="object-contain"
        />
      </div>

      {/* Answer Card */}
      <div className="overflow-hidden">
        {currentSlide.answers[0].src && (
          <div
            className={`relative w-full ${currentSlide.answers[0].height} z-10`}
          >
            <Image
              src={currentSlide.answers[0].src}
              alt={currentSlide.answers[0].alt}
              fill
              className="object-contain"
            />
          </div>
        )}

        {currentSlide.answers[1] && (
          <div
            className={`relative w-full ${currentSlide.answers[1].height} ${currentSlide.answers[1].top}  left-20`}
          >
            <Image
              src={currentSlide.answers[1].src}
              alt={currentSlide.answers[1].alt}
              fill
              className="object-contain"
            />
          </div>
        )}

        <div
          className={cn(
            'relative scale-[1.1] bottom-4  w-full h-14 flex items-center justify-center ',
            currentSlideNo === 2 ? 'mt-8' : ''
          )}
        >
          <Image
            src="/auth-slider/input.svg"
            alt="Input"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-5 right-0 left-0 flex justify-center gap-2 mt-8">
        {slides.map((_, index) => (
          <button
            key={index}
            className={cn(
              'h-2 w-2 rounded-full transition-colors',
              currentSlideNo === index ? 'bg-blue-600' : 'bg-gray-300'
            )}
            onClick={() => setCurrentSlideNo(index)}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
