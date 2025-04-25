'use client';

import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { Badge } from '@/components/ui/badge';
import { X, Plus, User, Loader2, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FormDescription } from '@/components/ui/form';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface SelectedParticipant {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

interface ParticipantsSelectorProps {
  selectedParticipants: SelectedParticipant[];
  onParticipantAdd: (participant: SelectedParticipant) => void;
  onParticipantRemove: (participantId: string) => void;
}

export default function ParticipantsSelector({ 
  selectedParticipants, 
  onParticipantAdd, 
  onParticipantRemove 
}: ParticipantsSelectorProps) {
  const { filteredUsers, searchTerm, setSearchTerm, isLoading } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user} = useAuth();
  const currentUserId = user?.id;

  const handleAddParticipant = (user: SelectedParticipant) => {
    onParticipantAdd(user);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleRemoveParticipant = (userId: string) => {
    // Prevent removing current user
    if (userId === currentUserId) return;
    onParticipantRemove(userId);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex items-center space-x-2 border rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          {selectedParticipants.length > 0 && (
            <div className="flex flex-wrap gap-2 mr-2">
              {selectedParticipants.map((participant) => (
                <Badge 
                  key={participant.id} 
                  variant="secondary"
                  className="flex items-center gap-1 pl-2 pr-1 py-1.5"
                >
                  {participant.image ? (
                    <Image 
                      src={participant.image} 
                      alt={participant.name || ""} 
                      width={16} 
                      height={16} 
                      className="rounded-full mr-1" 
                    />
                  ) : (
                    <User className="h-3 w-3 mr-1" />
                  )}
                  <span>{participant.name || participant.email}</span>
                  {participant.id === currentUserId ? (
                    <span title="You are always included in the trip">
                      <Lock className="h-3 w-3 ml-1 text-muted-foreground" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      title="Remove participant"
                      onClick={() => handleRemoveParticipant(participant.id)}
                      className="ml-1 text-muted-foreground rounded-full hover:bg-muted p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          )}
          <div className="relative flex-1">
              {/* Input field */}
              <Input
                type="email"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search users by email..."
                className="pl-8 border-none shadow-none h-8 focus-visible:ring-0 p-0"
              />
            </div>
        </div>
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {/* Search results dropdown */}
        {isDropdownOpen && searchTerm && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto border">
            {filteredUsers.length > 0 ? (
              <ul className="py-1 text-sm">
                {filteredUsers.map((user) => (
                  <li 
                    key={user.id}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer",
                      selectedParticipants.some(p => p.id === user.id) && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => {
                      if (!selectedParticipants.some(p => p.id === user.id)) {
                        handleAddParticipant(user);
                      }
                    }}
                  >
                    {user.image ? (
                      <Image 
                        src={user.image} 
                        alt={user.name} 
                        width={24} 
                        height={24} 
                        className="rounded-full" 
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Plus 
                      className={cn(
                        "h-4 w-4",
                        selectedParticipants.some(p => p.id === user.id) ? "text-muted-foreground" : "text-primary"
                      )} 
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                No users found with that email
              </div>
            )}
          </div>
        )}
      </div>
      <FormDescription>
        You will be automatically included as a participant. Search for additional users by email to add them to your trip.
      </FormDescription>
    </div>
  );
}
