'use client';

import Image from 'next/image';
import * as React from 'react';

import { cn } from '@/lib/utils'; // Assuming this utility helps with conditional class names

interface Slide {
  question: string;
}

const slides: Slide[] = [
  {
    question: '/auth-slider/new/auth-slider-1.svg',
  },
  {
    question: '/auth-slider/new/auth-slider-2.svg',
  },
  {
    question: '/auth-slider/new/auth-slider-3.svg',
  },
];

export function AuthSlider() {
  const [currentSlideNo, setCurrentSlideNo] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [entering, setEntering] = React.useState(true);

  const currentSlide = slides[currentSlideNo];

  // Auto-slide effect
  React.useEffect(() => {
    const slideInterval = setInterval(() => {
      if (!isAnimating) {
        setEntering(false);
        setIsAnimating(true);

        setTimeout(() => {
          setCurrentSlideNo((prevSlide) => (prevSlide + 1) % slides.length);
          setEntering(true);
        }, 700);
      }
    }, 3500);

    return () => clearInterval(slideInterval);
  }, [isAnimating]);

  // Handle enter animation completion
  React.useEffect(() => {
    if (entering) {
      const animationCompleteTimeout = setTimeout(() => {
        setIsAnimating(false);
      }, 700);

      return () => {
        clearTimeout(animationCompleteTimeout);
      };
    }
  }, [entering, currentSlideNo]);

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 sm:px-8 md:px-16 py-6 md:py-8 h-full flex flex-col justify-center bg-white rounded-2xl overflow-hidden shadow-lg min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
      {/* Main Slide Container */}
      <div
        key={currentSlideNo}
        className={cn(
          'relative w-full h-full flex flex-col items-center justify-center transition-all duration-700 ease-in-out',
          entering ? 'animate-question-enter' : 'animate-question-exit',
          !entering && 'pointer-events-none'
        )}
        style={{ transitionDelay: entering ? '0s' : '0s' }}
      >
        {/* Question Image - Main Content */}
        <div className="relative w-full max-w-lg aspect-[4/3] flex items-center justify-center mt-2">
          <Image
            src={currentSlide.question || '/placeholder.svg'}
            alt="Question"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            className={cn(
              'h-3 w-3 md:h-4 md:w-4 rounded-full border-2 border-blue-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400',
              currentSlideNo === index
                ? 'bg-blue-dark scale-110'
                : 'bg-gray-300',
              isAnimating && 'pointer-events-none'
            )}
            onClick={() => {
              if (!isAnimating && index !== currentSlideNo) {
                setEntering(false);
                setIsAnimating(true);

                setTimeout(() => {
                  setCurrentSlideNo(index);
                  setEntering(true);
                }, 700);
              }
            }}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// Animations (add to global CSS or module)
// .animate-bubble-in { animation: bubbleIn 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
// .animate-arrow-bounce { animation: arrowBounce 1.2s infinite alternate cubic-bezier(0.22, 1, 0.36, 1); }
// @keyframes bubbleIn { 0% { opacity: 0; transform: scale(0.8) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
// @keyframes arrowBounce { 0% { transform: translateY(0); } 100% { transform: translateY(-10px); } }
// .animate-step-btt-in { animation: stepBttIn 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
// .animate-step-btt-out { animation: stepBttOut 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
// @keyframes stepBttIn { 0% { opacity: 0; transform: translateY(40px);} 100% { opacity: 1; transform: translateY(0);} }
// @keyframes stepBttOut { 0% { opacity: 1; transform: translateY(0);} 100% { opacity: 0; transform: translateY(40px);} }
