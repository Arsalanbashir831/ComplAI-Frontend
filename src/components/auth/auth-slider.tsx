'use client';

import * as React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

// interface Answer {
//   src: string;
//   alt: string;
//   className?: string;
// }

interface Slide {
  question: string;

  className?: string;
}

const slides: Slide[] = [
  {
    question: '/auth-slider/new/auth-slider-1.svg',

    className: 'h-[100%]',
  },
  {
    question: '/auth-slider/new/auth-slider-2.svg',

    className: 'h-[100%]',
  },
  {
    question: '/auth-slider/new/auth-slider-3.svg',

    className: 'h-[100%]',
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
    <div className="relative w-full  px-4 py-8 h-full flex flex-col justify-center items-center  bg-white rounded-2xl">
      {/* Question Card */}
      <div
        className={cn(
          'relative w-96 flex justify-center items-center  ',
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
