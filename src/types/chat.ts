/**
 * Buildify AI - Chat Type Definitions
 * Copyright (c) 2024 Sajal
 *
 * @author Sajal
 * @license MIT
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'cto';
  content: string;
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  conversationEnded: boolean;
}
