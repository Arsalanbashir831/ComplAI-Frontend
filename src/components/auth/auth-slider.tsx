'use client';

import * as React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

interface Answer {
  src: string;
  alt: string;
  className?: string;
}

interface Slide {
  question: string;
  answers: Answer[];
  className?: string;
}

const slides: Slide[] = [
  {
    question: '/auth-slider/q1.svg',
    answers: [
      { src: '/auth-slider/a1-a.svg', alt: 'Answer-1', className: 'h-16' },
      {
        src: '/auth-slider/a1-b.svg',
        alt: 'Answer-2',
        className: 'h-64 -top-8',
      },
    ],
    className: 'h-20',
  },
  {
    question: '/auth-slider/q2.svg',
    answers: [
      { src: '/auth-slider/a2-a.svg', alt: 'Answer-1', className: 'h-16' },
      {
        src: '/auth-slider/a2-b.svg',
        alt: 'Answer-2',
        className: 'h-64 -top-8',
      },
    ],
    className: 'h-28',
  },
  {
    question: '/auth-slider/q3.svg',
    answers: [
      { src: '', alt: '', className: '' },
      {
        src: '/auth-slider/a3.svg',
        alt: 'Answer-1',
        className: 'h-40 top-0 left-10',
      },
    ],
    className: 'h-24',
  },
];

export function AuthSlider() {
  const [currentSlideNo, setCurrentSlideNo] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(true);
  const [staggerIndex, setStaggerIndex] = React.useState(0);
  const currentSlide = slides[currentSlideNo];

  React.useEffect(() => {
    const slideInterval = setInterval(() => {
      // Start fade-out animation
      setIsVisible(false);

      // Change slide after fade-out animation
      setTimeout(() => {
        setCurrentSlideNo((prevSlide) => (prevSlide + 1) % slides.length);
        setStaggerIndex(0);
        setIsVisible(true);
      }, 1000); // Wait for fade-out animation to complete
    }, 10000);

    return () => clearInterval(slideInterval);
  }, []);

  React.useEffect(() => {
    if (isVisible && staggerIndex < 3) {
      const staggerTimeout = setTimeout(() => {
        setStaggerIndex((prevIndex) => prevIndex + 1);
      }, 900);

      return () => clearTimeout(staggerTimeout);
    }
  }, [isVisible, staggerIndex]);

  const fadeInClass = (index: number) =>
    isVisible && staggerIndex >= index ? 'animate-fade-in-bottom' : 'opacity-0';

  const fadeOutClass = !isVisible ? 'animate-fade-out-bottom' : '';

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 py-8 h-full flex flex-col justify-center bg-white rounded-2xl">
      {/* Question Card */}
      <div
        className={cn(
          'relative w-full right-10',
          currentSlide.className,
          fadeInClass(0),
          fadeOutClass
        )}
      >
        <Image
          src={currentSlide.question || '/placeholder.svg'}
          alt="Question"
          fill
          className="object-contain"
        />
      </div>

      {/* Answer Card */}
      <div className="overflow-hidden">
        {currentSlide.answers[0].src && (
          <div
            className={cn(
              'relative w-full z-10',
              currentSlide.answers[0].className,
              fadeInClass(1),
              fadeOutClass
            )}
          >
            <Image
              src={currentSlide.answers[0].src || '/placeholder.svg'}
              alt={currentSlide.answers[0].alt}
              fill
              className="object-contain"
            />
          </div>
        )}

        {currentSlide.answers[1] && (
          <div
            className={cn(
              'relative w-full left-20',
              currentSlide.answers[1].className,
              fadeInClass(2),
              fadeOutClass
            )}
          >
            <Image
              src={currentSlide.answers[1].src || '/placeholder.svg'}
              alt={currentSlide.answers[1].alt}
              fill
              className="object-contain"
            />
          </div>
        )}

        <div
          className={cn(
            'relative bottom-4 w-full h-16 flex items-center justify-center',
            currentSlideNo === 2 ? 'mt-8' : '',
            fadeInClass(3),
            fadeOutClass
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
              'h-4 w-4 rounded-full transition-colors',
              currentSlideNo === index ? 'bg-blue-dark' : 'bg-gray-300'
            )}
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => {
                setCurrentSlideNo(index);
                setStaggerIndex(0);
                setIsVisible(true);
              }, 1000);
            }}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
