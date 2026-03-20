import React, { useState, useEffect } from 'react';
import type { Message as MessageType, FeedbackStatus, Grade, HintLevel, Mode } from '../types';
import { User, Bot, Lightbulb, RefreshCw, LoadingSpinner } from './icons';
import { renderMathHTML } from '../services/formatter';

interface MessageProps {
  message: MessageType;
  onSuggestionAction?: (grade: Grade) => void;
  onFeedback?: (messageId: string, status: FeedbackStatus) => void;
  onRequestSimilar?: (context: NonNullable<MessageType['guidanceContext']>) => void;
  onImageClick?: (src: string) => void;
}

export const Message: React.FC<MessageProps> = ({ message, onSuggestionAction, onFeedback, onRequestSimilar, onImageClick }) => {
  const isUser = message.role === 'user';
  const [isRequestingSimilar, setIsRequestingSimilar] = useState(false);
  
  if (isUser && message.userContext) {
    const { grade, level, mode, problemText, studentStepText, isProblemSubmission } = message.userContext;
    const levelMap: Record<HintLevel, string> = { light: 'LIGHT', step: 'STEP', outline: 'OUTLINE' };
    
    const [renderedContent, setRenderedContent] = useState('');

    useEffect(() => {
      let textToRender = '';
      if (isProblemSubmission) {
        textToRender = problemText.trim() || (message.images && message.images.length > 0 ? '(Xem ảnh đề bài)' : '(Chưa nhập văn bản)');
      } else {
        textToRender = studentStepText.trim() || (message.images && message.images.length > 0 ? '(Xem ảnh bài làm)' : '(Chưa nhập văn bản)');
      }

      const renderContent = () => {
        setRenderedContent(renderMathHTML(textToRender));
      };

      if (window.katex) {
        renderContent();
        return;
      }

      const intervalId = setInterval(() => {
        if (window.katex) {
          clearInterval(intervalId);
          renderContent();
        }
      }, 100);

      return () => clearInterval(intervalId);
    }, [problemText, studentStepText, isProblemSubmission, message.images]);


    return (
      <div className="animate-fade-in">
        <div className="flex items-start gap-3 msg user flex-row-reverse">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300">
            <User className="w-5 h-5" />
          </div>
          <div className="p-3 rounded-xl max-w-xl w-full">
            <div className="text-sm font-semibold text-[var(--muted)] mb-2 font-mono uppercase">
              Lớp {grade} | {levelMap[level]} | {mode.toUpperCase()}
            </div>
            <div className="space-y-2 text-base break-words">
                <span className="font-semibold text-[var(--fg)] opacity-80">{isProblemSubmission ? "Đề:" : "Phản hồi của em:"}</span>{' '}
                <span dangerouslySetInnerHTML={{ __html: renderedContent }} />
            </div>
            
            {message.images && message.images.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {message.images.map((img, index) => {
                  const src = `data:${message.imageMimeTypes?.[index] || 'image/jpeg'};base64,${img}`;
                  return (
                    <div key={index} className="relative">
                      <img 
                        src={src}
                        alt={`Đính kèm ${index + 1}`} 
                        className="w-full h-auto object-cover aspect-square rounded-lg border border-[var(--border)] cursor-pointer" 
                        onClick={() => onImageClick && onImageClick(src)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback for assistant messages or legacy user messages
  const [renderedContent, setRenderedContent] = useState<string>('');

  useEffect(() => {
    const renderContent = () => {
      setRenderedContent(renderMathHTML(message.content));
    };

    if (window.katex) {
      renderContent();
      return;
    }

    const intervalId = setInterval(() => {
      if (window.katex) {
        clearInterval(intervalId);
        renderContent();
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [message.content]);

  const showFeedbackOptions = !isUser && message.isGuidance && message.feedback === 'unanswered' && !message.suggestion;

  return (
    <div className="animate-fade-in">
      <div className={`flex items-start gap-3 msg ${isUser ? 'flex-row-reverse user' : 'assistant'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300' : 'bg-blue-100 text-blue-600 dark:bg-slate-700 dark:text-blue-400'}`}>
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>
        <div className="p-3 rounded-xl max-w-xl">
          <div 
            dangerouslySetInnerHTML={{ __html: renderedContent }}
            className="text-base leading-relaxed break-words"
          />
          
          {message.images && message.images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {message.images.map((img, index) => {
                const src = `data:${message.imageMimeTypes?.[index] || 'image/jpeg'};base64,${img}`;
                return (
                  <div key={index} className="relative">
                    <img 
                      src={src}
                      alt={`Đính kèm ${index + 1}`} 
                      className="w-full h-auto object-cover aspect-square rounded-lg border border-[var(--border)] cursor-pointer" 
                      onClick={() => onImageClick && onImageClick(src)}
                    />
                  </div>
                )
              })}
            </div>
          )}

          {message.suggestion?.type === 'CHANGE_GRADE' && onSuggestionAction && (
            <div className="mt-4 flex flex-wrap gap-2">
              {message.suggestion.suggestedGrades.map(grade => (
                <button
                  key={grade}
                  onClick={() => onSuggestionAction(grade)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-sm text-green-700 bg-green-100 hover:bg-green-200 border border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Chọn Lớp {grade}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-2 pl-11">
          {showFeedbackOptions && onFeedback && (
            <div className="p-2 rounded-xl bg-[var(--card)] border border-[var(--border)] w-fit">
              <p className="text-sm font-semibold text-[var(--muted)] mb-2">Em thấy gợi ý vừa rồi thế nào?</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => onFeedback(message.id, 'understood')}
                  className="button !text-sm text-white bg-green-500 hover:bg-green-600"
                >
                  ✅ Em hiểu rồi!
                </button>
                <button
                  onClick={() => onFeedback(message.id, 'needs_more')}
                  className="button !text-sm text-white bg-amber-500 hover:bg-amber-600"
                >
                  🤔 Em cần gợi ý thêm
                </button>
                <button
                  onClick={() => onFeedback(message.id, 'too_hard')}
                  className="button !text-sm text-white bg-red-500 hover:bg-red-600"
                >
                  😥 Khó quá ạ
                </button>
              </div>
            </div>
          )}
          {message.feedback === 'understood' && onRequestSimilar && message.guidanceContext && (
            <div className="mt-2">
              <button
                onClick={async () => {
                  if (!onRequestSimilar || !message.guidanceContext || isRequestingSimilar) return;
                  setIsRequestingSimilar(true);
                  try {
                    await onRequestSimilar(message.guidanceContext);
                  } finally {
                    setIsRequestingSimilar(false);
                  }
                }}
                disabled={isRequestingSimilar}
                className="button button-primary !text-base"
              >
                {isRequestingSimilar ? (
                  <LoadingSpinner className="w-4 h-4" />
                ) : (
                  <Lightbulb className="w-4 h-4" />
                )}
                {isRequestingSimilar ? 'Đang tạo bài...' : 'Gợi bài tương tự để luyện thêm'}
              </button>
            </div>
          )}
        </div>
    </div>
  );
};