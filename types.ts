// Fix: Replaced incorrect service logic with proper type definitions to resolve all import errors.
export type Grade = '6' | '7' | '8' | '9';

export type HintLevel = 'light' | 'step' | 'outline';

export type Mode = 'guide' | 'check' | 'similar';

export type FontSize = 'sm' | 'base' | 'lg';

export type FeedbackStatus = 'unanswered' | 'understood' | 'needs_more' | 'too_hard';

// Fix: Added missing FeedbackStats type to resolve import error in AnalyticsPanel.tsx.
export interface FeedbackStats {
  understood: number;
  needs_more: number;
  too_hard: number;
}

export type GeneralFeedbackCategory = 'bug' | 'suggestion' | 'content' | 'other';

export interface ComplianceResult {
  ok: boolean;
  reason: string;
  suggestedGrades?: Grade[];
}

export interface GuidanceContext {
  problem: string;
  image: string[];
  imageMimeType: string[];
  grade: Grade;
  tags: string[];
}

export interface ChangeGradeSuggestion {
  type: 'CHANGE_GRADE';
  suggestedGrades: Grade[];
}

export interface UserMessageContext {
  grade: Grade;
  level: HintLevel;
  mode: Mode;
  problemText: string;
  studentStepText: string;
  isProblemSubmission: boolean;
}


export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestion?: ChangeGradeSuggestion;
  images?: string[];
  imageMimeTypes?: string[];
  isGuidance?: boolean;
  feedback?: FeedbackStatus;
  guidanceContext?: GuidanceContext;
  userContext?: UserMessageContext;
}

export interface FeedbackEvent {
  id: string;
  messageId: string;
  timestamp: number;
  grade: Grade | 'N/A';
  problem: string;
  status: FeedbackStatus;
}

export interface Session {
    id: string;
    timestamp: number;
    grade: Grade;
    level: HintLevel;
    mode: Mode;
    problem: string;
    studentStep: string;
    images: string[];
    imageMimeTypes: string[];
    studentImages: string[];
    studentImageMimeTypes: string[];
    conversation: Message[];
    feedbackLog: FeedbackEvent[];
    isProblemActive: boolean;
}

export interface GuidanceParams {
    grade: Grade;
    level: HintLevel;
    mode: Mode;
    problem: string;
    studentStep: string;
    image: string[];
    imageMimeType: string[];
    studentImages: string[];
    studentImageMimeTypes: string[];
    tags: string[];
    compliance: ComplianceResult;
    feedback?: FeedbackStatus;
    history?: Message[];
}
