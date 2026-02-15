/**
 * Block Analytics Event Types
 * 
 * Comprehensive analytics tracking for interactive blocks.
 * These events provide granular detail beyond basic BLOCK_COMPLETION.
 */

// ============================================
// BASE TYPES
// ============================================

export type SessionEventType = 'started' | 'completed' | 'abandoned';
export type InteractionType = 'click' | 'input' | 'drag' | 'scroll' | 'hover' | 'focus' | 'blur' | 'submit' | 'select';
export type QuestionEventType = 'started' | 'answered' | 'skipped' | 'reviewed';
export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank' | 'essay' | 'matching' | 'ordering';
export type SlideEventType = 'viewed' | 'completed' | 'skipped';

// ============================================
// INTERACTION EVENTS
// ============================================

export interface InteractionEvent {
  type: 'BLOCK_INTERACTION';
  interactionType: InteractionType;
  blockId?: string;            // Optional: wrappers will add when forwarding
  sessionId: string;
  elementId?: string;          // Which element was interacted with
  elementType?: string;         // Type of element (button, input, etc.)
  timestamp: number;
  duration?: number;            // How long interaction lasted (ms)
  data?: Record<string, any>;   // Interaction-specific data
}

// ============================================
// QUESTION/ANSWER EVENTS
// ============================================

export interface QuestionEvent {
  type: 'BLOCK_QUESTION';
  eventType: QuestionEventType;
  blockId?: string;            // Optional: wrappers will add when forwarding
  sessionId: string;
  questionId: string;
  questionType: QuestionType;
  questionText?: string;        // Optional: the actual question
  timestamp: number;
  
  // Timing
  timeToAnswer?: number;        // Milliseconds from question display to answer
  
  // Answer data
  answer?: any;                 // User's answer
  correctAnswer?: any;          // Correct answer (if applicable)
  isCorrect?: boolean;
  score?: number;
  maxScore?: number;
  
  // Context
  attemptNumber?: number;       // If multiple attempts allowed
  hintsUsed?: number;           // Number of hints used
  confidenceLevel?: number;     // User's confidence (if collected)
}

// ============================================
// SLIDE VIEW EVENTS
// ============================================

export interface SlideViewEvent {
  type: 'SLIDE_VIEW';
  slideId: string;
  courseId?: string;
  sessionId: string;
  eventType: SlideEventType;
  timestamp: number;
  timeSpent: number;            // Milliseconds on this slide
  
  // Additional context
  slideType?: string;           // 'page' | 'video' | 'block' | 'quiz' | etc.
  slideTitle?: string;
  scrollDepth?: number;         // % of content scrolled (0-100)
  mediaProgress?: number;       // % of video/audio played (0-100)
  interactionCount?: number;    // Number of interactions on this slide
}

// ============================================
// SESSION SUMMARY EVENT
// ============================================

export interface SessionSummary {
  completed: boolean;
  score?: number;
  maxScore?: number;
  timeSpent: number;            // Total milliseconds
  
  // Aggregated metrics
  totalInteractions: number;
  questionsAttempted?: number;
  questionsCorrect?: number;
  questionsIncorrect?: number;
  questionsSkipped?: number;
  slidesViewed?: number;
  
  // Performance metrics
  averageTimePerQuestion?: number;  // Milliseconds
  averageTimePerSlide?: number;     // Milliseconds
  accuracyRate?: number;            // 0-1 (percentage correct)
  
  // Engagement metrics
  hintsUsedTotal?: number;
  attemptsTotal?: number;
}

export interface BlockSessionEvent {
  type: 'BLOCK_SESSION';
  eventType: SessionEventType;
  blockId?: string;            // Optional: wrappers will add when forwarding
  slideId?: string;             // For course context
  courseId?: string;            // For course context
  sessionId: string;
  timestamp: number;
  
  // Summary data
  summary: SessionSummary;
  
  // Detailed breakdown (optional, for deep analytics)
  // Only included when session completes
  details?: {
    interactions?: InteractionEvent[];
    questions?: QuestionEvent[];
    slides?: SlideViewEvent[];
  };
}

// ============================================
// LEGACY COMPATIBILITY
// ============================================

export interface LegacyBlockCompletionEvent {
  type: 'BLOCK_COMPLETION';
  completed: boolean;
  score?: number;
  maxScore?: number;
  timeSpent?: number;           // Milliseconds (duration, NOT a timestamp)
  timestamp: number;            // Unix timestamp in ms (Date.now())
  data?: Record<string, any>;   // Additional data
}

// ============================================
// UNION TYPE FOR ALL EVENTS
// ============================================

export type BlockAnalyticsEvent = 
  | BlockSessionEvent 
  | InteractionEvent 
  | QuestionEvent 
  | SlideViewEvent 
  | LegacyBlockCompletionEvent;

// ============================================
// CONFIGURATION OPTIONS
// ============================================

export interface BlockTrackerConfig {
  // Context IDs - all optional, wrappers will enrich events with correct IDs
  blockId?: string;
  slideId?: string;
  courseId?: string;
  
  // Tracking options
  trackInteractions?: boolean;      // Default: true
  trackQuestions?: boolean;         // Default: true
  sendDetailedEvents?: boolean;     // Default: true (send real-time events)
  sendSummaryEvent?: boolean;       // Default: true (send session summary)
  sendLegacyEvent?: boolean;        // Default: true (backwards compatibility)
  
  // Debouncing options
  interactionDebounce?: number;     // Default: 100ms
  progressUpdateInterval?: number;  // Default: 5000ms (5s)
  
  // Storage options
  persistSession?: boolean;         // Default: false (persist to localStorage)
  sessionStorageKey?: string;       // Default: 'blockTracker_{blockId}'
}

// ============================================
// HELPER TYPES
// ============================================

export interface QuestionAttempt {
  questionId: string;
  attempts: QuestionEvent[];
  bestScore?: number;
  totalTimeSpent: number;
}

export interface SessionState {
  sessionId: string;
  blockId?: string;  // Optional - wrappers will add when forwarding events
  startTime: number;
  
  // Collected events
  interactions: InteractionEvent[];
  questions: QuestionEvent[];
  slides: SlideViewEvent[];
  
  // Current state
  currentQuestionId?: string;
  currentQuestionStartTime?: number;
  
  // Computed metrics
  totalInteractions: number;
  totalQuestions: number;
  correctQuestions: number;
}

// ============================================
// EVENT SENDER CALLBACK TYPE
// ============================================

export type EventSenderCallback = (event: BlockAnalyticsEvent) => void | Promise<void>;
