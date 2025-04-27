'use client'
import Image from 'next/image';

export default function Loading() {
  // Define the Loading UI here
  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Image
          src="/logo.svg"
          alt="Vonders"
          width={100}
          height={100}
        />

      </div>
      
    )
  }