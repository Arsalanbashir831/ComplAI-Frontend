'use client';

import * as React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils'; // Assuming this utility helps with conditional class names

interface Slide {
  question: string;
  promo: string;
  className?: string;
  // Add promoClassName to the interface
  promoClassName?: string;
}

const slides: Slide[] = [
  {
    question: '/auth-slider/new/auth-slider-1.svg',
    promo: '/auth-slider/new/auth-slider-promo-1.svg',
    className: 'h-[100%]',
    promoClassName: 'top-[300px] left-[100px] translate-x-1/2 z-10', // Example: Centered horizontally, fixed top
  },
  {
    question: '/auth-slider/new/auth-slider-2.svg',
    promo: '/auth-slider/new/auth-slider-promo-2.png',
    className: 'h-[100%]',
    promoClassName: 'top-[470px] left-0 -translate-y-1/2 z-10', // Example: Centered vertically on the left
  },
  {
    question: '/auth-slider/new/auth-slider-3.svg',
    promo: '/auth-slider/new/auth-slider-promo-3.svg',
    className: 'h-[100%]',
    promoClassName: 'top-[90px] z-10 left-[150px] ', // Example: Bottom right corner
  },
];

export function AuthSlider() {
  const [currentSlideNo, setCurrentSlideNo] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false); // To prevent rapid transitions
  const [entering, setEntering] = React.useState(true); // Tracks if elements are entering or exiting
  const [showPromo, setShowPromo] = React.useState(false); // Manages promo visibility

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
        }, 700); // Duration of the exit animation
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
    <div className="relative w-full max-w-3xl mx-auto px-16 py-8 h-full flex flex-col justify-center bg-white rounded-2xl overflow-hidden">
      {/* Question Card */}
      <div
        key={currentSlideNo}
        className={cn(
          'relative w-full transition-all duration-700 ease-in-out',
          currentSlide.className,
          getQuestionAnimationClass(),
          !entering && 'pointer-events-none'
        )}
        style={{ transitionDelay: entering ? '0s' : '0s' }}
      >
        <div
          className={cn(
            'absolute w-full h-14 bg-contain bg-center bg-no-repeat hidden lg:block',
            // Apply the currentSlide.promoClassName here!
            currentSlide.promoClassName,
            getPromoAnimationClass()
          )}
          style={{ backgroundImage: `url(${currentSlide.promo})` }}
        />

        <Image
          src={currentSlide.question || '/placeholder.svg'}
          alt="Question"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-20 right-0 left-0 flex justify-center gap-2 mt-8 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            className={cn(
              'h-4 w-4 rounded-full transition-colors duration-300',
              currentSlideNo === index ? 'bg-blue-dark' : 'bg-gray-300',
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
