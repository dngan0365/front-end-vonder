'use client'
import React from 'react';
import ChatList from '@/components/chatbot/chatList/chatList';

export default function ChatLayout({
    children,
  }: {
    children: React.ReactNode
  }){
    return (
        <div className="flex h-[calc(100vh-65px)]">
            <ChatList />
            <div className="flex-1 p-3 overflow-y-auto">
                {children}
            </div>
        </div>
    );
};