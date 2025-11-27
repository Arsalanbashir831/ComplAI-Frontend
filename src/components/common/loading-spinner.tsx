'use client';

import { cn } from "@/lib/utils";

export default function LoadingSpinner({ className, loadingText }: { className?: string, loadingText?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 items-center justify-center h-screen", className)}>
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p>
        {loadingText}
      </p>
    </div>
  );
}
