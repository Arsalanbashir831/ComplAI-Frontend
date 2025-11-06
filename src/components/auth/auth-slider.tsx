'use client';

import * as React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

interface Slide {
  question: string;
  alt: string;
}

const slides: Slide[] = [
  {
    question: '/auth-slider/new/auth-slider-1.svg',
    alt: 'Compl-AI feature showcase slide 1 - Document analysis and compliance checking',
  },
  {
    question: '/auth-slider/new/auth-slider-2.svg',
    alt: 'Compl-AI feature showcase slide 2 - AI-powered compliance recommendations',
  },
  {
    question: '/auth-slider/new/auth-slider-3.svg',
    alt: 'Compl-AI feature showcase slide 3 - Automated reporting and tracking',
  },
];

export function AuthSlider() {
  const [currentSlideNo, setCurrentSlideNo] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [entering, setEntering] = React.useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  const currentSlide = slides[currentSlideNo];

  // Check for reduced motion preference
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auto-slide effect (disabled if user prefers reduced motion)
  React.useEffect(() => {
    if (prefersReducedMotion) return;

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
  }, [isAnimating, prefersReducedMotion]);

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

  const handleSlideChange = React.useCallback(
    (index: number) => {
      if (!isAnimating && index !== currentSlideNo) {
        if (prefersReducedMotion) {
          setCurrentSlideNo(index);
        } else {
          setEntering(false);
          setIsAnimating(true);

          setTimeout(() => {
            setCurrentSlideNo(index);
            setEntering(true);
          }, 700);
        }
      }
    },
    [isAnimating, currentSlideNo, prefersReducedMotion]
  );

  return (
    <section
      className="relative w-full max-w-3xl mx-auto px-4 sm:px-8 md:px-16 py-6 md:py-8 h-full flex flex-col justify-center bg-white rounded-2xl overflow-hidden shadow-lg min-h-[400px] md:min-h-[500px] lg:min-h-[600px]"
      aria-label="Product feature carousel"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Main Slide Container */}
      <div
        key={currentSlideNo}
        className={cn(
          'relative w-full h-full flex flex-col items-center justify-center',
          !prefersReducedMotion &&
            'transition-all duration-700 ease-in-out',
          !prefersReducedMotion &&
            (entering ? 'animate-question-enter' : 'animate-question-exit'),
          !entering && 'pointer-events-none'
        )}
        role="region"
        aria-label={`Slide ${currentSlideNo + 1} of ${slides.length}`}
      >
        {/* Feature Image */}
        <div className="relative w-full max-w-lg aspect-[4/3] flex items-center justify-center mt-2">
          <Image
            src={currentSlide.question || '/placeholder.svg'}
            alt={currentSlide.alt}
            fill
            className="object-contain"
            priority={currentSlideNo === 0}
            loading={currentSlideNo === 0 ? 'eager' : 'lazy'}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>

      {/* Navigation Dots */}
      <nav
        className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10"
        aria-label="Carousel navigation"
      >
        {slides.map((slide, index) => (
          <button
            key={index}
            type="button"
            className={cn(
              'h-3 w-3 md:h-4 md:w-4 rounded-full border-2 border-blue-200 transition-colors duration-300',
              currentSlideNo === index
                ? 'bg-blue-dark scale-110'
                : 'bg-gray-300',
              isAnimating && 'pointer-events-none'
            )}
            onClick={() => handleSlideChange(index)}
            aria-label={`Go to slide ${index + 1}: ${slide.alt}`}
            aria-current={currentSlideNo === index ? 'true' : 'false'}
          />
        ))}
      </nav>
    </section>
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
