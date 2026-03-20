
import React, { useEffect, useRef } from 'react';
import type { Message as MessageType, FeedbackStatus, GuidanceContext, Grade } from '../types';
import { Message } from './Message';
import { LoadingSpinner } from './icons';

interface ChatPanelProps {
  conversation: MessageType[];
  isLoading: boolean;
  onSuggestionAction?: (grade: Grade) => void;
  onFeedback?: (messageId: string, status: FeedbackStatus) => void;
  onRequestSimilar?: (context: NonNullable<MessageType['guidanceContext']>) => void;
  onImageClick?: (src: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ conversation, isLoading, onSuggestionAction, onFeedback, onRequestSimilar, onImageClick }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isLoading]);

  return (
    <section className="panel p-4 flex flex-col min-h-[500px]">
      <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">Hỏi – đáp định hướng</h2>
      <div className="flex-grow h-0 overflow-y-auto pr-2">
        <div className="flex flex-col gap-4">
          {conversation.map((msg) => (
            <Message 
              key={msg.id} 
              message={msg} 
              onSuggestionAction={onSuggestionAction}
              onFeedback={onFeedback}
              onRequestSimilar={onRequestSimilar}
              onImageClick={onImageClick}
            />
          ))}
          {isLoading && (
            <div className="flex flex-col justify-center items-center p-8 space-y-4">
              <LoadingSpinner className="w-10 h-10 text-[var(--primary-500)] animate-spin" />
              <div className="text-sm text-[var(--muted)] animate-pulse text-center">Cô đang suy nghĩ, em đợi một chút nhé...</div>
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('reset-ai-request'));
                }}
                className="text-xs text-red-500 underline hover:text-red-700"
              >
                Dừng lại & Thử lại
              </button>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
    </section>
  );
};