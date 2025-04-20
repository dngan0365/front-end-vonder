'use client'
import Image from 'next/image';
import NextNProgress from 'nextjs-progressbar';

export default function Loading() {
  // Define the Loading UI here
  return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Image
          src="/logo.svg"
          alt="Vonders"
          width={100}
          height={100}
        />
        <NextNProgress color="#77DAE6" startPosition={0.3} stopDelayMs={200} height={3} showOnShallow={true} />
      </div>
      
    )
  }