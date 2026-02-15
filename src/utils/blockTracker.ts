/**
 * BlockTracker - Comprehensive Analytics Tracking for Interactive Blocks
 * 
 * This utility provides a simple API for blocks to track:
 * - User interactions (clicks, inputs, etc.)
 * - Question attempts and answers
 * - Time spent on activities
 * - Session completion with detailed metrics
 * 
 * Usage:
 * ```typescript
 * const tracker = new BlockTracker({ blockId: 'my-block' });
 * 
 * // Track interactions
 * tracker.trackInteraction('click', 'submit-button');
 * 
 * // Track questions
 * tracker.startQuestion('q1', 'multiple-choice');
 * tracker.answerQuestion('q1', 'answer-A', 'answer-A', true, 1, 1);
 * 
 * // Complete the session
 * tracker.complete(score, maxScore);
 * ```
 */

import type {
  BlockTrackerConfig,
  BlockSessionEvent,
  InteractionEvent,
  QuestionEvent,
  SlideViewEvent,
  LegacyBlockCompletionEvent,
  SessionState,
  EventSenderCallback,
  InteractionType,
  QuestionType,
  QuestionEventType,
} from '../../../website/src/types/blockAnalytics';

export class BlockTracker {
  private config: Required<BlockTrackerConfig>;
  private state: SessionState;
  private isCompleted: boolean = false;
  private eventSenders: EventSenderCallback[] = [];
  
  // Debounce timers
  private progressTimer?: number;
  
  constructor(config: BlockTrackerConfig = {}) {
    // Set default configuration
    // Note: blockId, slideId, courseId are optional and will be added by wrappers
    this.config = {
      blockId: config.blockId || '',
      slideId: config.slideId || '',
      courseId: config.courseId || '',
      trackInteractions: config.trackInteractions ?? true,
      trackQuestions: config.trackQuestions ?? true,
      sendDetailedEvents: config.sendDetailedEvents ?? true,
      sendSummaryEvent: config.sendSummaryEvent ?? true,
      sendLegacyEvent: config.sendLegacyEvent ?? true,
      interactionDebounce: config.interactionDebounce ?? 100,
      progressUpdateInterval: config.progressUpdateInterval ?? 5000,
      persistSession: config.persistSession ?? false,
      sessionStorageKey: config.sessionStorageKey ?? `blockTracker_${config.blockId || 'anonymous'}`,
    };
    
    // Initialize or restore session state
    this.state = this.restoreOrCreateSession();
    
    // Send session started event
    this.sendSessionEvent('started');
    
    // Setup periodic progress updates (optional)
    if (this.config.progressUpdateInterval > 0) {
      this.startProgressUpdates();
    }
    
    // Setup beforeunload handler to capture abandonment
    this.setupUnloadHandler();
  }
  
  // ============================================
  // PUBLIC API - INTERACTIONS
  // ============================================
  
  /**
   * Track a user interaction
   */
  trackInteraction(
    interactionType: InteractionType,
    elementId?: string,
    data?: Record<string, any>,
    elementType?: string,
    duration?: number
  ): void {
    if (!this.config.trackInteractions || this.isCompleted) return;
    
    const event: InteractionEvent = {
      type: 'BLOCK_INTERACTION',
      interactionType,
      blockId: this.config.blockId,
      sessionId: this.state.sessionId,
      elementId,
      elementType,
      timestamp: Date.now(),
      duration,
      data,
    };
    
    this.state.interactions.push(event);
    this.state.totalInteractions++;
    
    if (this.config.sendDetailedEvents) {
      this.sendEvent(event);
    }
    
    this.persistSession();
  }
  
  // ============================================
  // PUBLIC API - QUESTIONS
  // ============================================
  
  /**
   * Mark the start of a question
   */
  startQuestion(questionId: string, questionType: QuestionType, questionText?: string): void {
    if (!this.config.trackQuestions || this.isCompleted) return;
    
    this.state.currentQuestionId = questionId;
    this.state.currentQuestionStartTime = Date.now();
    
    const event: QuestionEvent = {
      type: 'BLOCK_QUESTION',
      eventType: 'started',
      blockId: this.config.blockId,
      sessionId: this.state.sessionId,
      questionId,
      questionType,
      questionText,
      timestamp: Date.now(),
    };
    
    this.state.questions.push(event);
    
    if (this.config.sendDetailedEvents) {
      this.sendEvent(event);
    }
    
    this.persistSession();
  }
  
  /**
   * Record an answer to a question
   */
  answerQuestion(
    questionId: string,
    answer: any,
    correctAnswer: any,
    isCorrect: boolean,
    score: number,
    maxScore: number,
    options?: {
      questionType?: QuestionType;
      questionText?: string;
      attemptNumber?: number;
      hintsUsed?: number;
    }
  ): void {
    if (!this.config.trackQuestions || this.isCompleted) return;
    
    const timeToAnswer = this.state.currentQuestionId === questionId && this.state.currentQuestionStartTime
      ? Date.now() - this.state.currentQuestionStartTime
      : undefined;
    
    const event: QuestionEvent = {
      type: 'BLOCK_QUESTION',
      eventType: 'answered',
      blockId: this.config.blockId,
      sessionId: this.state.sessionId,
      questionId,
      questionType: options?.questionType || 'multiple-choice',
      questionText: options?.questionText,
      timestamp: Date.now(),
      timeToAnswer,
      answer,
      correctAnswer,
      isCorrect,
      score,
      maxScore,
      attemptNumber: options?.attemptNumber,
      hintsUsed: options?.hintsUsed,
    };
    
    this.state.questions.push(event);
    this.state.totalQuestions++;
    if (isCorrect) {
      this.state.correctQuestions++;
    }
    
    // Reset current question tracking
    this.state.currentQuestionId = undefined;
    this.state.currentQuestionStartTime = undefined;
    
    if (this.config.sendDetailedEvents) {
      this.sendEvent(event);
    }
    
    this.persistSession();
  }
  
  /**
   * Record a skipped question
   */
  skipQuestion(questionId: string, questionType?: QuestionType): void {
    if (!this.config.trackQuestions || this.isCompleted) return;
    
    const event: QuestionEvent = {
      type: 'BLOCK_QUESTION',
      eventType: 'skipped',
      blockId: this.config.blockId,
      sessionId: this.state.sessionId,
      questionId,
      questionType: questionType || 'multiple-choice',
      timestamp: Date.now(),
    };
    
    this.state.questions.push(event);
    
    if (this.config.sendDetailedEvents) {
      this.sendEvent(event);
    }
    
    this.persistSession();
  }
  
  // ============================================
  // PUBLIC API - COMPLETION
  // ============================================
  
  /**
   * Mark the block session as complete
   */
  complete(score?: number, maxScore?: number, additionalData?: Record<string, any>): void {
    if (this.isCompleted) return;
    
    this.isCompleted = true;
    const timeSpent = Date.now() - this.state.startTime;
    
    // Send session completed event
    this.sendSessionEvent('completed', {
      score,
      maxScore,
      timeSpent,
      additionalData,
    });
    
    // Send legacy BLOCK_COMPLETION event for backwards compatibility
    if (this.config.sendLegacyEvent) {
      this.sendLegacyCompletion(score, maxScore, timeSpent, additionalData);
    }
    
    // Clear progress timer
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
    }
    
    // Clear persisted session
    if (this.config.persistSession) {
      this.clearPersistedSession();
    }
  }
  
  /**
   * Mark the block session as abandoned (called automatically on beforeunload)
   */
  abandon(): void {
    if (this.isCompleted) return;
    
    this.isCompleted = true;
    const timeSpent = Date.now() - this.state.startTime;
    
    this.sendSessionEvent('abandoned', { timeSpent });
    
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
    }
  }
  
  // ============================================
  // PUBLIC API - EVENT LISTENERS
  // ============================================
  
  /**
   * Add a custom event sender (for forwarding events to backend, etc.)
   */
  addEventListener(callback: EventSenderCallback): void {
    this.eventSenders.push(callback);
  }
  
  /**
   * Remove an event sender
   */
  removeEventListener(callback: EventSenderCallback): void {
    this.eventSenders = this.eventSenders.filter(cb => cb !== callback);
  }
  
  // ============================================
  // PUBLIC API - STATE ACCESS
  // ============================================
  
  /**
   * Get current session state (for debugging)
   */
  getState(): Readonly<SessionState> {
    return { ...this.state };
  }
  
  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.state.sessionId;
  }
  
  /**
   * Get time spent so far (in milliseconds)
   */
  getTimeSpent(): number {
    return Date.now() - this.state.startTime;
  }
  
  // ============================================
  // PRIVATE METHODS
  // ============================================
  
  private restoreOrCreateSession(): SessionState {
    if (this.config.persistSession) {
      try {
        const stored = localStorage.getItem(this.config.sessionStorageKey);
        if (stored) {
          const state = JSON.parse(stored) as SessionState;
          // Validate the session is for the same block
          if (state.blockId === this.config.blockId) {
            return state;
          }
        }
      } catch (error) {
        console.warn('[BlockTracker] Failed to restore session:', error);
      }
    }
    
    // Create new session
    return {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      blockId: this.config.blockId,
      startTime: Date.now(),
      interactions: [],
      questions: [],
      slides: [],
      totalInteractions: 0,
      totalQuestions: 0,
      correctQuestions: 0,
    };
  }
  
  private persistSession(): void {
    if (!this.config.persistSession) return;
    
    try {
      localStorage.setItem(
        this.config.sessionStorageKey,
        JSON.stringify(this.state)
      );
    } catch (error) {
      console.warn('[BlockTracker] Failed to persist session:', error);
    }
  }
  
  private clearPersistedSession(): void {
    if (!this.config.persistSession) return;
    
    try {
      localStorage.removeItem(this.config.sessionStorageKey);
    } catch (error) {
      console.warn('[BlockTracker] Failed to clear session:', error);
    }
  }
  
  private sendSessionEvent(
    eventType: 'started' | 'completed' | 'abandoned',
    data?: {
      score?: number;
      maxScore?: number;
      timeSpent?: number;
      additionalData?: Record<string, any>;
    }
  ): void {
    const timeSpent = data?.timeSpent ?? (Date.now() - this.state.startTime);
    
    const answeredQuestions = this.state.questions.filter(q => q.eventType === 'answered');
    const correctQuestions = answeredQuestions.filter(q => q.isCorrect);
    const incorrectQuestions = answeredQuestions.filter(q => !q.isCorrect);
    const skippedQuestions = this.state.questions.filter(q => q.eventType === 'skipped');
    
    const event: BlockSessionEvent = {
      type: 'BLOCK_SESSION',
      eventType,
      blockId: this.config.blockId,
      slideId: this.config.slideId,
      courseId: this.config.courseId,
      sessionId: this.state.sessionId,
      timestamp: Date.now(),
      summary: {
        completed: eventType === 'completed',
        score: data?.score,
        maxScore: data?.maxScore,
        timeSpent,
        totalInteractions: this.state.totalInteractions,
        questionsAttempted: answeredQuestions.length + skippedQuestions.length,
        questionsCorrect: correctQuestions.length,
        questionsIncorrect: incorrectQuestions.length,
        questionsSkipped: skippedQuestions.length,
        averageTimePerQuestion: answeredQuestions.length > 0
          ? answeredQuestions.reduce((sum, q) => sum + (q.timeToAnswer || 0), 0) / answeredQuestions.length
          : undefined,
        accuracyRate: answeredQuestions.length > 0
          ? correctQuestions.length / answeredQuestions.length
          : undefined,
        hintsUsedTotal: this.state.questions.reduce((sum, q) => sum + (q.hintsUsed || 0), 0),
      },
    };
    
    // Include detailed events only on completion if configured
    if (eventType === 'completed' && this.config.sendSummaryEvent) {
      event.details = {
        interactions: this.state.interactions,
        questions: this.state.questions,
        slides: this.state.slides,
      };
    }
    
    this.sendEvent(event);
  }
  
  private sendLegacyCompletion(
    score?: number,
    maxScore?: number,
    timeSpent?: number,
    data?: Record<string, any>
  ): void {
    const legacyEvent: LegacyBlockCompletionEvent = {
      type: 'BLOCK_COMPLETION',
      completed: true,
      score,
      maxScore,
      timeSpent,
      data,
    };
    
    this.sendEvent(legacyEvent);
  }
  
  private sendEvent(event: any): void {
    // Send via postMessage (for iframe communication)
    try {
      window.postMessage(event, '*');
      window.parent.postMessage(event, '*');
    } catch (error) {
      console.warn('[BlockTracker] Failed to send postMessage:', error);
    }
    
    // Send to registered event listeners
    this.eventSenders.forEach(sender => {
      try {
        sender(event);
      } catch (error) {
        console.warn('[BlockTracker] Event sender error:', error);
      }
    });
  }
  
  private startProgressUpdates(): void {
    this.progressTimer = window.setInterval(() => {
      if (!this.isCompleted) {
        // Could send periodic progress updates here if needed
        // For now, just persist session
        this.persistSession();
      }
    }, this.config.progressUpdateInterval);
  }
  
  private setupUnloadHandler(): void {
    const handler = () => {
      if (!this.isCompleted) {
        // Use sendBeacon for reliable delivery on unload
        this.abandon();
      }
    };
    
    window.addEventListener('beforeunload', handler);
    window.addEventListener('pagehide', handler);
  }
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Create a tracker instance with common defaults
 */
export function createBlockTracker(blockId: string, options?: Partial<BlockTrackerConfig>): BlockTracker {
  return new BlockTracker({
    blockId,
    ...options,
  });
}

/**
 * Export for use in blocks
 */
export default BlockTracker;
