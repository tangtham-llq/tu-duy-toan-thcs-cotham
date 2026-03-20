

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { InputPanel } from './components/InputPanel';
import { ChatPanel } from './components/ChatPanel';
import { classifyProblem, getGuidance } from './services/geminiService';
import { checkCompliance, roughDetectTags, isMathProblemOrConcept } from './services/curriculumService';
import { getTermExplanation } from './services/termExplanationService';
import { useTheme } from './hooks/useTheme';
import { errorLoggingService } from './services/errorLoggingService';
import type { Message, Grade, HintLevel, Mode, ComplianceResult, FeedbackStatus, GuidanceContext, FeedbackEvent, Session, ChangeGradeSuggestion, GeneralFeedbackCategory, FontSize, UserMessageContext, GuidanceParams } from './types';
import { History, Trash2, Download, AssistantIcon, SunIcon, MoonIcon, FontSizeIcon, Mail } from './components/icons';
import Lightbox from './components/Lightbox';

const WELCOME_MESSAGE: Message = {
  id: 'welcome-0',
  role: 'assistant',
  content: `👋 Chào em!
Hãy làm theo các bước sau để bắt đầu học cùng Trợ lý Tư duy Toán học nhé:

1️⃣ Chọn khối lớp (6, 7, 8 hoặc 9) cho đúng với mình.
2️⃣ Nhập đề bài Toán hoặc tải ảnh chụp đề lên.
3️⃣ Chọn mức độ gợi ý: Gợi ý nhẹ, Hướng dẫn từng bước, hoặc Dàn ý (ẩn đáp số).
4️⃣ Nhấn “Lấy gợi ý”, hệ thống sẽ gợi mở cách suy nghĩ và hướng làm, giúp em tự tìm ra lời giải.

💡 Lưu ý: Ứng dụng không cho đáp án sẵn, mà chỉ hỏi – gợi ý – dẫn dắt để em tự hiểu, tự làm và yêu thích môn Toán hơn!`,
};

const categoryMap: Record<GeneralFeedbackCategory, string> = {
    bug: 'Báo lỗi',
    suggestion: 'Góp ý',
    content: 'Nội dung không phù hợp',
    other: 'Khác',
};


const FeedbackModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const [category, setCategory] = useState<GeneralFeedbackCategory>('bug');
  const [content, setContent] = useState('');
  const [includeLogs, setIncludeLogs] = useState(category === 'bug');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 10) {
      alert('Vui lòng nhập nội dung phản hồi dài hơn 10 ký tự.');
      return;
    }
    
    const subject = `Phản hồi về ứng dụng Toán THCS: ${categoryMap[category]}`;
    let body = `Phân loại: ${categoryMap[category]}\n\nNội dung chi tiết:\n${content}`;
    
    if (includeLogs) {
      const logs = errorLoggingService.exportLogs();
      body += `\n\n--- THÔNG TIN KỸ THUẬT (LOGS) ---\n${logs}`;
    }
    
    const mailtoLink = `mailto:tththam.thcsllquan@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="modal-content w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <header className="header p-5 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-lg font-bold">Gửi phản hồi</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="feedback-category" className="block text-base font-semibold mb-2">Phân loại phản hồi</label>
              <select
                id="feedback-category"
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value as GeneralFeedbackCategory;
                  setCategory(newCat);
                  if (newCat === 'bug') setIncludeLogs(true);
                }}
              >
                <option value="bug">Báo lỗi</option>
                <option value="suggestion">Góp ý tính năng</option>
                <option value="content">Nội dung không phù hợp</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div>
              <label htmlFor="feedback-content" className="block text-base font-semibold mb-2">Nội dung chi tiết</label>
              <textarea
                id="feedback-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Mô tả lỗi bạn gặp, hoặc ý tưởng của bạn để cải thiện ứng dụng..."
                rows={6}
                required
                minLength={10}
                className="min-h-[160px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="include-logs" 
                checked={includeLogs} 
                onChange={(e) => setIncludeLogs(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="include-logs" className="text-sm cursor-pointer">
                Đính kèm nhật ký kỹ thuật (giúp cô gỡ lỗi nhanh hơn)
              </label>
            </div>
          </div>
          <footer className="p-4 bg-[var(--chip)] border-t border-[var(--border)] rounded-b-2xl flex justify-end gap-3">
            <button type="button" onClick={onClose} className="button button-ghost">
              Huỷ
            </button>
            <button type="submit" disabled={content.trim().length < 10} className="button button-primary">
              Gửi phản hồi
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

const HistoryPanel: React.FC<{
    sessions: Session[];
    onClose: () => void;
    onLoad: (sessionId: string) => void;
    onDelete: (sessionId: string) => void;
    onResetAll: () => void;
}> = ({ sessions, onClose, onLoad, onDelete, onResetAll }) => {
    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="modal-content w-full max-w-3xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="header p-5 flex justify-between items-center rounded-t-2xl">
                    <h2 className="text-lg font-bold">Lịch sử 5 phiên gần nhất</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
                </header>
                <div className="p-5 overflow-y-auto">
                    {sessions.length === 0 ? (
                        <p className="text-center text-[var(--muted)] py-12 text-lg">Chưa có phiên nào được lưu.</p>
                    ) : (
                        <ul className="space-y-3">
                            {sessions.map(session => (
                                <li key={session.id} className="p-4 bg-[var(--chip)] rounded-xl border border-[var(--border)] flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-[var(--muted)]">{new Date(session.timestamp).toLocaleString()}</p>
                                        <p className="text-base font-semibold truncate">
                                            Lớp {session.grade}: {session.problem.substring(0, 80) || '(Bài toán hình ảnh)'}...
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 flex gap-2">
                                        <button onClick={() => onLoad(session.id)} className="button button-ghost p-2" title="Tải lại phiên này">
                                            <Download className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => onDelete(session.id)} className="button button-ghost p-2 hover:!bg-red-500/10 hover:!text-red-500 hover:!border-red-500/20" title="Xóa phiên này">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="mt-6 pt-4 border-t border-[var(--border)] flex justify-between items-center">
                        <button 
                            onClick={onResetAll}
                            className="text-sm text-red-500 hover:text-red-700 underline font-medium"
                        >
                            Cài đặt lại toàn bộ ứng dụng
                        </button>
                        <button onClick={onClose} className="button button-primary px-8">Đóng</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const AppHeader: React.FC<{
    onShowHistory: () => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    fontSize: FontSize;
    setFontSize: (size: FontSize) => void;
}> = ({ onShowHistory, theme, setTheme, fontSize, setFontSize }) => {
    const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
    const fontMenuRef = useRef<HTMLDivElement>(null);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fontMenuRef.current && !fontMenuRef.current.contains(event.target as Node)) {
                setIsFontMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    return (
        <header className="header sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                    <AssistantIcon className="w-12 h-12" />
                    <div>
                        <h1 className="text-base sm:text-lg font-bold">TRỢ LÝ TƯ DUY TOÁN HỌC – KHỐI TRUNG HỌC CƠ SỞ</h1>
                        <p className="text-sm opacity-80 hidden sm:block">Cùng hiểu – cùng nghĩ – cùng khám phá</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <div className="relative">
                        <button
                            onClick={() => setIsFontMenuOpen(prev => !prev)}
                            className="p-2 text-white/80 hover:text-white hover:bg-black/10 rounded-full"
                            aria-label="Thay đổi cỡ chữ"
                            title="Thay đổi cỡ chữ"
                        >
                            <FontSizeIcon className="w-5 h-5" />
                        </button>
                        {isFontMenuOpen && (
                            <div ref={fontMenuRef} className="card absolute right-0 mt-2 w-40 p-2 z-10">
                                <p className="text-sm font-semibold text-[var(--muted)] px-2 py-1 mb-1">Cỡ chữ</p>
                                <button onClick={() => { setFontSize('sm'); setIsFontMenuOpen(false); }} className={`w-full text-left px-3 py-2 rounded-md text-base hover:bg-[var(--chip)] ${fontSize === 'sm' ? 'font-bold bg-[var(--chip)]' : ''}`}>Nhỏ</button>
                                <button onClick={() => { setFontSize('base'); setIsFontMenuOpen(false); }} className={`w-full text-left px-3 py-2 rounded-md text-base hover:bg-[var(--chip)] ${fontSize === 'base' ? 'font-bold bg-[var(--chip)]' : ''}`}>Vừa</button>
                                <button onClick={() => { setFontSize('lg'); setIsFontMenuOpen(false); }} className={`w-full text-left px-3 py-2 rounded-md text-base hover:bg-[var(--chip)] ${fontSize === 'lg' ? 'font-bold bg-[var(--chip)]' : ''}`}>Lớn</button>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-white/80 hover:text-white hover:bg-black/10 rounded-full"
                        aria-label="Chuyển đổi chế độ sáng/tối"
                        title="Chuyển đổi chế độ sáng/tối"
                    >
                        {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={onShowHistory}
                        className="p-2 text-white/80 hover:text-white hover:bg-black/10 rounded-full"
                        aria-label="Xem lịch sử phiên"
                        title="Xem lịch sử phiên học"
                    >
                        <History className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

const App: React.FC = () => {
  const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
  };

  const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
      try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
      } catch (error) {
        console.error(`Error reading from localStorage for key "${key}". Data might be corrupted. Resetting to default.`, error);
        try {
          localStorage.removeItem(key);
        } catch (removeError) {
           console.error(`Failed to remove corrupted key "${key}" from localStorage`, removeError);
        }
        return defaultValue;
      }
    });
  
    const debouncedState = useDebounce(state, 500);

    useEffect(() => {
      try {
        localStorage.setItem(key, JSON.stringify(debouncedState));
      } catch (error) {
        console.error(`Error writing to localStorage for key "${key}". Storage might be full.`, error);
      }
    }, [key, debouncedState]);
  
    return [state, setState];
  };

  const [grade, setGrade] = usePersistentState<Grade>('math-app-grade', '6');
  const [level, setLevel] = usePersistentState<HintLevel>('math-app-level', 'light');
  const [mode, setMode] = usePersistentState<Mode>('math-app-mode', 'guide');
  const [problem, setProblem] = usePersistentState<string>('math-app-problem', '');
  const [studentStep, setStudentStep] = usePersistentState<string>('math-app-studentStep', '');
  const [images, setImages] = useState<string[]>([]);
  const [imageMimeTypes, setImageMimeTypes] = useState<string[]>([]);
  const [studentImages, setStudentImages] = useState<string[]>([]);
  const [studentImageMimeTypes, setStudentImageMimeTypes] = useState<string[]>([]);
  const [conversation, setConversation] = usePersistentState<Message[]>('math-app-conversation', [WELCOME_MESSAGE]);
  const [feedbackLog, setFeedbackLog] = usePersistentState<FeedbackEvent[]>('math-app-feedback-log', []);
  const [isProblemActive, setIsProblemActive] = usePersistentState<boolean>('math-app-isProblemActive', false);
  const [sessionHistory, setSessionHistory] = usePersistentState<Session[]>('math-app-session-history', []);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn("AI request timed out after 60s. Resetting state.");
        setIsLoading(false);
        aiRequestPending.current = false;
      }, 60000);
    } else {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, [isLoading]);

  useEffect(() => {
    const handleReset = () => {
      console.warn("Manual AI reset triggered.");
      setIsLoading(false);
      aiRequestPending.current = false;
    };
    window.addEventListener('reset-ai-request', handleReset);
    return () => window.removeEventListener('reset-ai-request', handleReset);
  }, []);

  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [lightboxImageSrc, setLightboxImageSrc] = useState<string | null>(null);
  const [theme, setTheme] = useTheme();
  const [fontSize, setFontSize] = usePersistentState<FontSize>('math-app-fontSize', 'base');
  const aiRequestPending = useRef(false);

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.remove('font-size-sm', 'font-size-base', 'font-size-lg');
    htmlElement.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);

  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      console.error("Lỗi ngoài luồng:", event.message, event);
      errorLoggingService.logError(event.error || event.message, 'runtime', {
        grade: stateRef.current.grade,
        level: stateRef.current.level,
        mode: stateRef.current.mode,
        problem: stateRef.current.problem,
        studentStep: stateRef.current.studentStep,
      });
      alert("⚠️ Ứng dụng gặp sự cố. Vui lòng thử lại hoặc làm mới trang.");
    };
  
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Promise lỗi không được xử lý:", event.reason);
      errorLoggingService.logError(event.reason, 'unhandled_rejection', {
        grade: stateRef.current.grade,
        level: stateRef.current.level,
        mode: stateRef.current.mode,
        problem: stateRef.current.problem,
        studentStep: stateRef.current.studentStep,
      });
      let message = "⚠️ Hệ thống AI đang gặp sự cố. Thử lại sau ít phút nhé!";
      if (event.reason instanceof Error) {
          if (event.reason.message.toLowerCase().includes('rate limit')) {
              message = "⚠️ Hệ thống AI đang quá tải, thử lại sau 1 phút nhé!";
          }
      }
      alert(message);
    };
  
    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
  
    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  // Use a ref to get the latest state inside callbacks without re-creating them
  const stateRef = useRef({ grade, level, mode, problem, studentStep, images, imageMimeTypes, studentImages, studentImageMimeTypes, conversation, isProblemActive });
  useEffect(() => {
    stateRef.current = { grade, level, mode, problem, studentStep, images, imageMimeTypes, studentImages, studentImageMimeTypes, conversation, isProblemActive };
  }, [grade, level, mode, problem, studentStep, images, imageMimeTypes, studentImages, studentImageMimeTypes, conversation, isProblemActive]);

  
  interface AddMessageOptions {
    suggestion?: Message['suggestion'];
    images?: string[];
    imageMimeTypes?: string[];
    isGuidance?: boolean;
    guidanceContext?: GuidanceContext;
    userContext?: UserMessageContext;
  }

  const addMessage = useCallback((role: 'user' | 'assistant', content: string, options: AddMessageOptions = {}) => {
    setConversation(prev => [...prev, {
      id: crypto.randomUUID(),
      role,
      content,
      suggestion: options.suggestion,
      images: options.images,
      imageMimeTypes: options.imageMimeTypes,
      isGuidance: options.isGuidance,
      feedback: options.isGuidance ? 'unanswered' : undefined,
      guidanceContext: options.isGuidance ? options.guidanceContext : undefined,
      userContext: options.userContext,
    }]);
  }, [setConversation]);

  const handleApiError = useCallback((e: any) => {
    console.error("Gemini API Error:", e);
    errorLoggingService.logError(e, 'api', {
      grade: stateRef.current.grade,
      level: stateRef.current.level,
      mode: stateRef.current.mode,
      problem: stateRef.current.problem,
      studentStep: stateRef.current.studentStep,
    });

    let errorMessage = "Rất tiếc, đã có sự cố xảy ra khi xử lý yêu cầu của em. Vui lòng thử lại sau nhé.";
    
    if (e) {
        const lowerCaseMessage = String(e.message || "").toLowerCase();
        const status = e.status || (e.response ? e.response.status : undefined);

        if (status === 429 || lowerCaseMessage.includes('429') || lowerCaseMessage.includes('rate limit')) {
            errorMessage = "Hệ thống đang hơi quá tải một chút. Em vui lòng đợi vài phút rồi thử lại nhé.";
        } else if (status === 504 || lowerCaseMessage.includes('504') || lowerCaseMessage.includes('timeout') || lowerCaseMessage.includes('deadline exceeded')) {
            errorMessage = "Yêu cầu mất quá nhiều thời gian để xử lý (có thể do hình ảnh quá lớn hoặc kết nối mạng chậm). Em hãy thử lại với hình ảnh rõ nét hơn hoặc chia nhỏ câu hỏi nhé.";
        } else if (status === 413 || lowerCaseMessage.includes('413') || lowerCaseMessage.includes('too large') || lowerCaseMessage.includes('payload too large')) {
            errorMessage = "Hình ảnh em gửi quá lớn. Hãy thử nén ảnh hoặc chụp lại với kích thước nhỏ hơn nhé.";
        } else if (lowerCaseMessage.includes('api key') || lowerCaseMessage.includes('invalid key')) {
            errorMessage = "Có lỗi về cấu hình hệ thống (API Key). Vui lòng liên hệ quản trị viên để kiểm tra lại.";
        } else if (lowerCaseMessage.includes('safety') || lowerCaseMessage.includes('blocked')) {
            errorMessage = "Nội dung em gửi có vẻ không phù hợp hoặc bị bộ lọc an toàn chặn lại. Hãy thử đặt câu hỏi khác nhé.";
        }
    }

    addMessage('assistant', errorMessage);
  }, [addMessage]);

  const handleClear = useCallback(() => {
    errorLoggingService.logAction('CLEAR_SESSION');
    if (isProblemActive && (problem.trim().length > 0 || images.length > 0) && conversation.length > 2) {
        const conversationWithoutImages = conversation.map((msg: Message): Message => {
            const { images, imageMimeTypes, ...rest } = msg;
            return rest;
        });

        const currentSession: Session = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            grade, level, mode, problem, studentStep, 
            images: [], // Do not save images in history to prevent storage overflow
            imageMimeTypes: [],
            studentImages: [],
            studentImageMimeTypes: [],
            conversation: conversationWithoutImages, 
            feedbackLog, isProblemActive
        };
        
        setSessionHistory(prev => {
            const updatedHistory = [currentSession, ...prev];
            if (updatedHistory.length > 5) {
                return updatedHistory.slice(0, 5);
            }
            return updatedHistory;
        });
    }

    setIsLoading(false);
    setGrade('6');
    setLevel('light');
    setMode('guide');
    setProblem('');
    setStudentStep('');
    setImages([]);
    setImageMimeTypes([]);
    setStudentImages([]);
    setStudentImageMimeTypes([]);
    setConversation([WELCOME_MESSAGE]);
    setFeedbackLog([]);
    setIsProblemActive(false);
  }, [isProblemActive, problem, images, conversation, grade, level, mode, studentStep, feedbackLog, setSessionHistory, setGrade, setLevel, setMode, setProblem, setStudentStep, setImages, setImageMimeTypes, setStudentImages, setStudentImageMimeTypes, setConversation, setFeedbackLog, setIsProblemActive]);
  
  const handleAsk = useCallback(async () => {
    if (aiRequestPending.current) {
        console.warn("AI request ignored, another is already in progress.");
        return;
    }

    const currentState = stateRef.current;
    console.log("handleAsk triggered. isProblemActive:", currentState.isProblemActive, "isLoading:", isLoading);
    
    if (!currentState.problem && currentState.images.length === 0) {
        alert("Nhập đề hoặc tải ảnh.");
        return;
    }

    try {
      errorLoggingService.logAction('ASK_GUIDANCE', {
        grade: currentState.grade,
        level: currentState.level,
        mode: currentState.mode,
        problem: currentState.problem,
        studentStep: currentState.studentStep,
      });
      aiRequestPending.current = true;
      setIsLoading(true);

      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
      if (!apiKey) {
          addMessage('assistant', "⚠️ **Lỗi cấu hình:** Không tìm thấy API Key cho Gemini. Nếu em đang dùng bản chia sẻ, hãy báo cho người quản trị nhé. Nếu em đang phát triển, hãy thêm `GEMINI_API_KEY` vào phần Secrets.");
          setIsLoading(false);
          aiRequestPending.current = false;
          return;
      }

      const userContext: UserMessageContext = {
        grade: currentState.grade,
        level: currentState.level,
        mode: currentState.mode,
        problemText: currentState.problem,
        studentStepText: currentState.studentStep,
        isProblemSubmission: !currentState.isProblemActive,
      };

      if (!currentState.isProblemActive) { // First turn
          console.log("First turn detection. Problem text:", currentState.problem);
          // Pre-filter non-math problems to avoid confusing AI and provide instant feedback.
          if (!isMathProblemOrConcept(currentState.problem) && currentState.images.length === 0) {
              console.warn("Input rejected by isMathProblemOrConcept.");
              addMessage('assistant', "📝 Có vẻ đây không phải là đề toán hoặc câu hỏi về khái niệm toán THCS. Em hãy thử lại với một đề bài toán, hoặc một câu hỏi như 'công thức tính chu vi hình tròn' nhé.");
              return; // Stop processing
          }
          
          addMessage('user', currentState.problem || '(Xem ảnh đề bài)', { 
              images: currentState.images, 
              imageMimeTypes: currentState.imageMimeTypes,
              userContext: userContext,
          });
          
          const explanation = getTermExplanation(currentState.problem);
          if (explanation) {
              addMessage('assistant', explanation);
          }
      } else { // Subsequent turns
          console.log("Subsequent turn. Student step:", currentState.studentStep);
          if (!currentState.studentStep && currentState.studentImages.length === 0) {
              alert("Em hãy nhập câu trả lời hoặc tải ảnh bài làm của mình nhé.");
              return;
          }
          addMessage('user', currentState.studentStep || '(Xem ảnh bài làm)', { 
              images: currentState.studentImages, 
              imageMimeTypes: currentState.studentImageMimeTypes,
              userContext: userContext,
          });
      }
      
      setStudentStep('');
      setStudentImages([]);
      setStudentImageMimeTypes([]);

      
          console.log("Calling classifyProblem...");
          let tags = roughDetectTags(currentState.problem);
          if (tags.length === 0 && (currentState.problem || currentState.images.length > 0)) {
              tags = await classifyProblem(currentState.problem, currentState.images, currentState.imageMimeTypes);
          }
          console.log("Tags detected:", tags);

          // Handle non-math content
          if (tags.includes('non_math')) {
              console.warn("Input rejected by AI classifier as non-math.");
              addMessage('assistant', "📝 Cô thấy đây không phải là một bài toán hoặc câu hỏi về kiến thức toán học THCS. Em hãy thử lại với một đề bài toán, hoặc một câu hỏi như 'công thức tính chu vi hình tròn' nhé.");
              return;
          }

          const compliance: ComplianceResult = checkCompliance(currentState.grade, tags);
          
          if (!compliance.ok) {
              const allGrades: Grade[] = ['6', '7', '8', '9'];
              const currentGradeIndex = allGrades.indexOf(currentState.grade);
              const higherGrades = allGrades.slice(currentGradeIndex + 1);

              const messageContent = `⚠️ **Cô thấy bài này có kiến thức của lớp cao hơn** (cụ thể là về **${compliance.reason}**), không thuộc chương trình lớp ${currentState.grade} em nhé.`;
              
              if (higherGrades.length > 0) {
                addMessage(
                  'assistant',
                  `${messageContent} Em có muốn tự động chuyển sang lớp phù hợp để cô hướng dẫn không?`,
                  { suggestion: { type: 'CHANGE_GRADE', suggestedGrades: higherGrades } }
                );
              } else {
                addMessage('assistant', `${messageContent} Em vui lòng kiểm tra lại đề bài hoặc chọn lại lớp cho đúng nhé.`);
              }
              return;
          }

          const baseParams: GuidanceParams = {
              grade: currentState.grade,
              level: currentState.level,
              mode: currentState.mode,
              problem: currentState.problem,
              studentStep: currentState.studentStep,
              image: currentState.images,
              imageMimeType: currentState.imageMimeTypes,
              studentImages: currentState.studentImages,
              studentImageMimeTypes: currentState.studentImageMimeTypes,
              tags,
              compliance,
              history: currentState.conversation
          };

          console.log("Calling getGuidance...");
          const response = await getGuidance(baseParams);
          console.log("getGuidance response received.");

          const guidanceContext: GuidanceContext = {
              problem: currentState.problem,
              image: currentState.images,
              imageMimeType: currentState.imageMimeTypes,
              grade: currentState.grade,
              tags
          };
          
          const rejectionKeywords = ["không phải là bài toán", "không phải đề toán", "gửi lại đề bài", "cung cấp một đề bài", "văn bản vô nghĩa", "không phù hợp", "không hợp lệ", "lớp cao hơn", "lớp trên", "không thuộc chương trình", "chọn lại khối lớp", "kiến thức của lớp"];
          const isRejected = rejectionKeywords.some(keyword => response.toLowerCase().includes(keyword));
          const isActualGuidance = !isRejected && (currentState.mode === 'guide' || currentState.mode === 'check') && compliance.ok;

          if (!isRejected) {
              setIsProblemActive(true);
          }

          addMessage('assistant', response, {
              isGuidance: isActualGuidance,
              guidanceContext: isActualGuidance ? guidanceContext : undefined,
          });

    } catch (e) {
        handleApiError(e);
    } finally {
        console.log("handleAsk finished. Resetting loading state.");
        setIsLoading(false);
        aiRequestPending.current = false;
    }
  }, [addMessage, isProblemActive, setIsProblemActive, setStudentStep, setStudentImages, setStudentImageMimeTypes, handleApiError]);
  
  const handleResetAllData = useCallback(() => {
    if (confirm("Em có chắc chắn muốn xóa toàn bộ lịch sử và dữ liệu đã lưu không? Hành động này không thể hoàn tác.")) {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('math-app-')) {
                localStorage.removeItem(key);
            }
        });
        window.location.reload();
    }
  }, []);

  const handleSuggestionAction = useCallback((grade: Grade) => {
    setGrade(grade);
    addMessage('assistant', `✅ Đã chuyển sang Lớp ${grade}. Em hãy nhấn "Lấy gợi ý" lại nhé.`);
  }, [setGrade, addMessage]);

  const handleFeedback = useCallback(async (messageId: string, status: FeedbackStatus) => {
    errorLoggingService.logAction('SUBMIT_FEEDBACK', { messageId, status });
    if (aiRequestPending.current) {
        console.warn("AI request ignored, another is already in progress.");
        return;
    }
    const originalMessage = stateRef.current.conversation.find(msg => msg.id === messageId);
    if (!originalMessage || !originalMessage.guidanceContext) return;

    setFeedbackLog(prev => [...prev, {
        id: crypto.randomUUID(),
        messageId,
        timestamp: Date.now(),
        grade: originalMessage.guidanceContext?.grade || 'N/A',
        problem: originalMessage.guidanceContext?.problem || '(ảnh)',
        status,
    }]);

    setConversation(prev =>
        prev.map(msg =>
            msg.id === messageId ? { ...msg, feedback: status } : msg
        )
    );
    
    if ((status === 'needs_more' || status === 'too_hard')) {
        try {
            aiRequestPending.current = true;
            setIsLoading(true);
            const response = await getGuidance({
                ...originalMessage.guidanceContext,
                studentImages: [],
                studentImageMimeTypes: [],
                level: stateRef.current.level, 
                mode: 'guide',
                studentStep: '',
                compliance: { ok: true, reason: '' },
                feedback: status,
            });
            
            addMessage('assistant', response, {
                isGuidance: true,
                guidanceContext: originalMessage.guidanceContext,
            });

        } catch (e) {
            handleApiError(e);
        } finally {
            setIsLoading(false);
            aiRequestPending.current = false;
        }
    }
  }, [addMessage, setConversation, setFeedbackLog, handleApiError]);

  const handleRequestSimilar = useCallback(async (context: GuidanceContext) => {
    errorLoggingService.logAction('REQUEST_SIMILAR', { context });
    if (aiRequestPending.current) {
        console.warn("AI request ignored, another is already in progress.");
        return;
    }
    if (!context) return;

    const compliance = checkCompliance(context.grade, context.tags);
    if (!compliance.ok) {
        addMessage('assistant', `Bài toán gốc thuộc chủ đề ${context.tags.join(', ')}, không phù hợp với Lớp ${context.grade}. Vì vậy, cô không thể tạo bài tương tự. Em hãy bắt đầu lại với một bài toán khác nhé.`);
        return;
    }

    try {
        aiRequestPending.current = true;
        setIsLoading(true);
        addMessage('user', "💡 Em muốn luyện thêm bài tương tự.");

        const newProblemText = await getGuidance({
            ...context,
            studentImages: [],
            studentImageMimeTypes: [],
            level: 'light', 
            mode: 'similar',
            studentStep: '',
            compliance: compliance,
        });

        // Update the application state to focus on the new problem
        setProblem(newProblemText);
        setImages([]);
        setImageMimeTypes([]);
        setStudentStep('');

        // Add the new problem to the chat for the user to see, and a follow-up instruction.
        addMessage('assistant', newProblemText);
        addMessage('assistant', 'Đây là bài toán mới để em luyện tập. Em hãy bắt đầu giải và cho cô biết các bước làm của mình nhé!');
        addMessage('assistant', '💡 Hoàn thành bài này xong, em hãy nhấn **"Bắt đầu lại"** ở bảng bên trái để mở một phiên học mới nếu muốn luyện thêm hoặc đổi chủ đề nhé!');

    } catch (e) {
        handleApiError(e);
    } finally {
        setIsLoading(false);
        aiRequestPending.current = false;
    }
  }, [addMessage, handleApiError, setProblem, setImages, setImageMimeTypes, setStudentStep, setIsProblemActive, setIsLoading]);
  
  const handleLoadSession = useCallback((sessionId: string) => {
      const sessionToLoad = sessionHistory.find(s => s.id === sessionId);
      if (sessionToLoad) {
          setGrade(sessionToLoad.grade);
          setLevel(sessionToLoad.level);
          setMode(sessionToLoad.mode);
          setProblem(sessionToLoad.problem);
          setStudentStep(sessionToLoad.studentStep);
          setImages(sessionToLoad.images);
          setImageMimeTypes(sessionToLoad.imageMimeTypes);
          setStudentImages(sessionToLoad.studentImages);
          setStudentImageMimeTypes(sessionToLoad.studentImageMimeTypes);
          setConversation(sessionToLoad.conversation);
          setFeedbackLog(sessionToLoad.feedbackLog);
          setIsProblemActive(sessionToLoad.isProblemActive);
          setShowHistory(false);
      }
  }, [sessionHistory, setGrade, setLevel, setMode, setProblem, setStudentStep, setImages, setImageMimeTypes, setStudentImages, setStudentImageMimeTypes, setConversation, setFeedbackLog, setIsProblemActive]);

  const handleDeleteSession = useCallback((sessionId: string) => {
      if (window.confirm('Bạn có chắc chắn muốn xóa phiên học này không?')) {
          setSessionHistory(prev => prev.filter(s => s.id !== sessionId));
      }
  }, [setSessionHistory]);
  
  const handleImageClick = (src: string) => {
    setLightboxImageSrc(src);
  };

  return (
    <div className="min-h-screen flex flex-col">
       <AppHeader 
        onShowHistory={() => setShowHistory(true)}
        theme={theme}
        setTheme={setTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />
      
      <div className="max-w-4xl w-full mx-auto px-4 pt-8">
        <div className="card p-6 mb-8">
            <div className="text-base space-y-3 leading-relaxed text-justify">
                <p>
                    Ứng dụng được sáng tạo bởi <strong>Cô Tăng Thị Hồng Thắm</strong>.
                </p>
                <p>
                    Giáo viên Toán THCS với hơn 20 năm kinh nghiệm giảng dạy và nghiên cứu đổi mới phương pháp học Toán, đồng hành cùng học sinh rèn luyện tư duy logic, khả năng suy luận và tự học thông qua những câu hỏi gợi mở, thay vì chỉ ghi nhớ lời giải có sẵn.
                </p>
                <p>
                    "<strong>TRỢ LÝ TƯ DUY TOÁN HỌC – KHỐI TRUNG HỌC CƠ SỞ</strong>" là người bạn đồng hành, giúp các em hiểu bản chất, tự tin và tìm thấy niềm vui trong Toán học nơi mỗi bài tập là một hành trình khám phá tri thức. Nội dung kiến thức được thiết kế theo chuẩn chương trình GDPT 2018.
                </p>
            </div>
        </div>
      </div>

      <main className="flex-grow max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
        <InputPanel
          grade={grade}
          setGrade={setGrade}
          level={level}
          setLevel={setLevel}
          mode={mode}
          setMode={setMode}
          problem={problem}
          setProblem={setProblem}
          studentStep={studentStep}
          setStudentStep={setStudentStep}
          images={images}
          setImages={setImages}
          setImageMimeTypes={setImageMimeTypes}
          imageMimeTypes={imageMimeTypes}
          studentImages={studentImages}
          setStudentImages={setStudentImages}
          studentImageMimeTypes={studentImageMimeTypes}
          setStudentImageMimeTypes={setStudentImageMimeTypes}
          onAsk={handleAsk}
          onClear={handleClear}
          isLoading={isLoading}
          isProblemActive={isProblemActive}
          hasConversation={conversation.length > 1}
        />
        <ChatPanel 
          conversation={conversation} 
          isLoading={isLoading} 
          onSuggestionAction={handleSuggestionAction}
          onFeedback={handleFeedback}
          // Fix: Corrected typo by passing handleRequestSimilar instead of the undefined onRequestSimilar.
          onRequestSimilar={handleRequestSimilar}
          onImageClick={handleImageClick}
        />
      </main>
      
      <footer className="app-footer mt-8">
          <p>© TĂNG THỊ HỒNG THẮM – 2025 | VER 1.0 | ALL RIGHTS RESERVED</p>
          <p>Trường THCS Lạc Long Quân | 1014/88/9 Tân Kỳ Tân Quý, phường Bình Hưng Hòa, TP. Hồ Chí Minh</p>
          <p className="mt-2 text-xs opacity-90 max-w-3xl mx-auto leading-relaxed">
            <strong>Lưu ý:</strong> Ứng dụng đang trong giai đoạn thử nghiệm, có thể còn một số hạn chế trong vận hành. Mong người dùng thông cảm, mọi góp ý vui lòng liên hệ cô Thắm nhé!
          </p>
      </footer>

      <button
        onClick={() => setShowFeedbackModal(true)}
        className="button button-primary fixed bottom-4 right-4 !p-3 !rounded-full shadow-lg z-40"
        aria-label="Gửi phản hồi"
        title="Gửi phản hồi, báo lỗi hoặc góp ý"
    >
        <Mail className="w-6 h-6" />
    </button>
      
      {showHistory && <HistoryPanel sessions={sessionHistory} onClose={() => setShowHistory(false)} onLoad={handleLoadSession} onDelete={handleDeleteSession} onResetAll={handleResetAllData} />}
      {showFeedbackModal && <FeedbackModal onClose={() => setShowFeedbackModal(false)} />}
      {lightboxImageSrc && <Lightbox src={lightboxImageSrc} onClose={() => setLightboxImageSrc(null)} />}
    </div>
  );
};

export default App;
