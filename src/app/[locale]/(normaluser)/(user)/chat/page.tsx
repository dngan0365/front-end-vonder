'use client'
import React from 'react';
import ChatBot from '@/components/chatbot/chat/chat';
import ChatList from '@/components/chatbot/chatList/chatList';

export default function Chat() {
    return (
        <div className="flex h-[calc(100vh-65px)]">
            <ChatList />
            <div className="flex-1 overflow-hidden">
                <ChatBot />
            </div>
        </div>
    );
};