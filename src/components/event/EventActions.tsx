'use client'
import { Bookmark, BookmarkCheck, Share2 } from 'lucide-react';

type EventActionsProps = {
  isSaved: boolean;
  savingInProgress: boolean;
  savedCount: number;
  onSave: () => void;
  onShare: () => void;
};

export default function EventActions({ 
  isSaved, 
  savingInProgress, 
  savedCount, 
  onSave, 
  onShare 
}: EventActionsProps) {



  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center">
          <button
            onClick={onSave}
            disabled={savingInProgress}
            className={`flex items-center px-4 py-2 rounded-full font-medium transition ${
              isSaved
                ? 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200'
                : 'bg-cyan-500 text-white hover:bg-cyan-600'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck size={18} className="mr-2" />
                Saved
              </>
            ) : (
              <>
                <Bookmark size={18} className="mr-2" />
                Save
              </>
            )}
          </button>

        {savedCount > 0 && (
          <span className="ml-2 text-sm text-gray-500">
            {savedCount} {savedCount === 1 ? 'person' : 'people'} saved this event
          </span>
        )}
      </div>

      <button
        onClick={onShare}
        className="p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Share event"
      >
        <Share2 size={20} className="text-gray-600" />
      </button>
    </div>
  );
}
