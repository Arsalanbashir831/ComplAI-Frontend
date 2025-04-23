// components/LottiePlayer.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Player } from '@lottiefiles/react-lottie-player';

type LottiePlayerProps = {
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  style?: React.CSSProperties;
  className?: string;
};

const LottiePlayer = ({
  animationData,
  loop = true,
  autoplay = true,
  speed = 1,
  style = { height: '300px', width: '300px' },
  className = '',
}: LottiePlayerProps) => {
  return (
    <Player
      autoplay={autoplay}
      loop={loop}
      src={animationData}
      speed={speed}
      style={style}
      className={className}
    />
  );
};

export default dynamic(() => Promise.resolve(LottiePlayer), { ssr: false });
