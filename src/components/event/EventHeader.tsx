import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

type EventHeaderProps = {
  coverImage: string;
  name: string;
  goBack: () => void;
};

export default function EventHeader({ coverImage, name, goBack }: EventHeaderProps) {
  return (
    <div className="relative h-64 lg:h-80">
      <button 
        onClick={goBack}
        className="absolute top-4 left-4 z-20 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition"
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 z-10" />
      
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ backgroundImage: `url(${coverImage})` }}
      />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        <h1 className="text-3xl font-bold text-white">{name}</h1>
      </div>
    </div>
  );
}
