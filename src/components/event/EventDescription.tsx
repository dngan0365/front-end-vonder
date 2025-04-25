import { useState } from 'react';

type EventDescriptionProps = {
  description: string;
};

export default function EventDescription({ description }: EventDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const isLongDescription = description.length > 300;
  
  const displayText = description;
  
  return (
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-3">About this event</h2>
      <div className="text-gray-700 whitespace-pre-line">
        <div dangerouslySetInnerHTML={{ __html: displayText }} />
      </div>
      
      {isLongDescription && (
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="mt-2 text-cyan-500 hover:text-cyan-600 font-medium"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}
