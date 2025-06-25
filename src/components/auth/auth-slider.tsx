'use client';

import * as React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils'; // Assuming this utility helps with conditional class names

interface Slide {
  question: string;
  promo: string;
  // Remove className and promoClassName for simpler, responsive layout
}

const slides: Slide[] = [
  {
    question: '/auth-slider/new/auth-slider-1.svg',
    promo: '/auth-slider/new/auth-slider-promo-1.svg',
  },
  {
    question: '/auth-slider/new/auth-slider-2.svg',
    promo: '/auth-slider/new/auth-slider-promo-2.png',
  },
  {
    question: '/auth-slider/new/auth-slider-3.svg',
    promo: '/auth-slider/new/auth-slider-promo-3.svg',
  },
];

export function AuthSlider() {
  const [currentSlideNo, setCurrentSlideNo] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [entering, setEntering] = React.useState(true);
  const [showPromo, setShowPromo] = React.useState(false);

  const currentSlide = slides[currentSlideNo];

  // Auto-slide effect
  React.useEffect(() => {
    const slideInterval = setInterval(() => {
      if (!isAnimating) {
        setEntering(false); // Start exit animation
        setIsAnimating(true);
        setShowPromo(false); // Hide promo immediately on exit

        setTimeout(() => {
          // After exit animation finishes, change slide and start enter animation
          setCurrentSlideNo((prevSlide) => (prevSlide + 1) % slides.length);
          setEntering(true); // Start enter animation
        }, 700);
      }
    }, 3500); // Changed back to 8 seconds for a more dynamic demo.
    // If you intend for it to be 80 seconds, change it back to 80000.

    return () => clearInterval(slideInterval);
  }, [isAnimating]);

  // Handle enter animation completion and promo display
  React.useEffect(() => {
    if (entering) {
      // Delay promo appearance after question has started animating in
      const promoDelay = setTimeout(() => {
        setShowPromo(true);
      }, 500); // Stagger the promo animation by 0.5s after question starts

      // After all entering animations complete, reset animating state
      const animationCompleteTimeout = setTimeout(() => {
        setIsAnimating(false);
      }, 700); // Matches the enter animation duration

      return () => {
        clearTimeout(promoDelay);
        clearTimeout(animationCompleteTimeout);
      };
    }
  }, [entering, currentSlideNo]);

  const getQuestionAnimationClass = () => {
    if (entering) {
      return 'animate-question-enter';
    } else {
      return 'animate-question-exit';
    }
  };

  const getPromoAnimationClass = () => {
    if (entering && showPromo) {
      return 'animate-promo-enter';
    } else if (!entering) {
      return 'animate-promo-exit';
    }
    return 'opacity-0'; // Initially hidden or when not showing
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 sm:px-8 md:px-16 py-6 md:py-8 h-full flex flex-col justify-center bg-white rounded-2xl overflow-hidden shadow-lg min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
      {/* Slide Content */}
      <div
        key={currentSlideNo}
        className={cn(
          'flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full h-full transition-all duration-700 ease-in-out',
          getQuestionAnimationClass(),
          !entering && 'pointer-events-none'
        )}
        style={{ transitionDelay: entering ? '0s' : '0s' }}
      >
        {/* Question Image */}
        <div className="relative w-full md:w-1/2 aspect-[4/3] flex items-center justify-center">
          <Image
            src={currentSlide.question || '/placeholder.svg'}
            alt="Question"
            fill
            className="object-contain"
            priority
          />
        </div>
        {/* Promo Image */}
        <div
          className={cn(
            'relative w-full md:w-1/2 flex items-center justify-center mt-4 md:mt-0',
            getPromoAnimationClass()
          )}
        >
          <div className="w-3/4 sm:w-2/3 md:w-full max-w-xs md:max-w-sm aspect-[4/3]">
            <Image
              src={currentSlide.promo}
              alt="Promo"
              fill
              className="object-contain"
              priority
            />
          </div>
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
                setShowPromo(false);

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
