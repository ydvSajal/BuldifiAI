/**
 * Buildify AI - CTO Chat Page
 * Copyright (c) 2024 Sajal
 *
 * @author Sajal
 * @license MIT
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, Bot, User, Sparkles, Loader2, RotateCcw, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { ChatMessage } from '@/types/chat';
import { readStartupInput, readStartupOverview, writeMasterplan } from '@/lib/startup-session';

const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50" />
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 90, 0],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      className="absolute -top-1/2 -right-1/2 w-[100%] h-[100%] rounded-full bg-gradient-to-br from-primary-100/40 via-purple-100/30 to-transparent"
    />
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        rotate: [0, -90, 0],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      className="absolute -bottom-1/2 -left-1/2 w-[100%] h-[100%] rounded-full bg-gradient-to-tr from-purple-100/40 via-primary-100/30 to-transparent"
    />
  </div>
);

export default function CTOChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ctoTyping, setCtoTyping] = useState(false);
  const [, setConversationStage] = useState<string>('intro');
  const [isMasterplanGenerated, setIsMasterplanGenerated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const overviewData = readStartupOverview();
    const inputData = readStartupInput();

    if (!overviewData || !inputData) {
      router.push('/');
      return;
    }

    if (messages.length === 0) {
      initializeChat();
    }
  }, [messages.length, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, ctoTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    const inputData = readStartupInput();
    const overviewData = readStartupOverview();

    const contextMessage = `Startup context:\n- Name: ${inputData?.name || 'Unknown'}\n- Description: ${inputData?.description || 'Not provided'}\n- Problem: ${overviewData?.problemStatement || 'Not specified'}\n- Target Audience: ${overviewData?.targetAudience || 'Not specified'}\n- MVP Features: ${overviewData?.mvpFeatures?.join(', ') || 'Not specified'}`;

    setCtoTyping(true);

    try {
      const response = await fetch('/api/cto-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: contextMessage }]
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize chat: ${response.status}`);
      }

      const data = await response.json();

      const ctoMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'cto',
        content: data.content,
        timestamp: new Date(),
      };

      setMessages([ctoMessage]);
      setConversationStage(data.stage || 'intro');
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setCtoTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || isMasterplanGenerated) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setCtoTyping(true);

    try {
      const response = await fetch('/api/cto-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role === 'cto' ? 'assistant' : 'user',
            content: m.content
          })).concat([{ role: 'user', content: userMessage.content }])
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const data = await response.json();

      const ctoMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'cto',
        content: data.content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, ctoMessage]);
      setConversationStage(data.stage || 'exploring');

      if (data.isMasterplan) {
        setIsMasterplanGenerated(true);
        writeMasterplan(data.content);
        setTimeout(() => {
          router.push('/masterplan');
        }, 3000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
      setCtoTyping(false);
      inputRef.current?.focus();
    }
  };

  const resetConversation = async () => {
    setMessages([]);
    setInput('');
    setIsMasterplanGenerated(false);
    setConversationStage('intro');

    try {
      await fetch('/api/cto-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
    } catch (error) {
      console.error('Error resetting conversation:', error);
    }

    initializeChat();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <AnimatedBackground />
      <main className="min-h-screen flex flex-col relative">
        {/* Enhanced Glassmorphic Header */}
        <header className="sticky top-0 z-50 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/overview')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </motion.button>
                  <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="p-3 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 backdrop-blur-sm border border-primary-500/30"
                    >
                      <Bot className="w-6 h-6 text-primary-600" />
                    </motion.div>
                    <div>
                      <h1 className="font-bold text-lg gradient-text">CTO Advisor</h1>
                      <p className="text-xs text-gray-500">AI-powered technical planning</p>
                    </div>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                  </span>
                  <span className="text-gray-600">Online</span>
                </motion.div>
              </div>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto relative">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {messages.length === 0 && !ctoTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="p-6 rounded-2xl glass-card mb-6"
                >
                  <MessageSquare className="w-12 h-12 text-primary-500" />
                </motion.div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Start Your CTO Conversation</h2>
                <p className="text-gray-500 max-w-md">
                  Your AI CTO advisor is ready to help you build a comprehensive technical masterplan
                </p>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                      message.role === 'cto'
                        ? 'bg-gradient-to-br from-primary-500 via-purple-500 to-primary-400'
                        : 'glass-card'
                    }`}
                  >
                    {message.role === 'cto' ? (
                      <Bot className="w-6 h-6 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </motion.div>
                  <div className={`flex-1 max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className={`inline-block p-5 rounded-2xl shadow-sm ${
                        message.role === 'cto'
                          ? 'glass-card rounded-tl-md'
                          : 'bg-gradient-to-r from-primary-500 via-purple-500 to-primary-400 text-white rounded-tr-md'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </motion.div>
                    <p className="text-xs text-gray-400 mt-2 px-1">
                      {message.role === 'cto' ? 'CTO Advisor' : 'You'} • {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {ctoTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 via-purple-500 to-primary-400 flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="glass-card p-5 rounded-2xl rounded-tl-md">
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Enhanced Input Footer */}
        <footer className="sticky bottom-0 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card px-6 py-4">
              <div className="flex gap-3">
                {isMasterplanGenerated ? (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/masterplan')}
                    className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-500
                               font-semibold text-white shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    View Your Masterplan
                  </motion.button>
                ) : (
                  <>
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask your CTO advisor anything..."
                        disabled={isLoading}
                        className="w-full px-5 py-4 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/60
                                   focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
                                   outline-none transition-all placeholder:text-gray-400 disabled:opacity-50 text-gray-800"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(14, 165, 233, 0.5)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={!input.trim() || isLoading}
                      className="px-6 py-4 rounded-xl bg-gradient-to-r from-primary-500 via-purple-500 to-primary-500
                                 font-semibold text-white shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed
                                 flex items-center gap-2 bg-[length:200%_100%] animate-[gradient-shift_3s_ease_infinite]"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </motion.button>
                  </>
                )}
              </div>
              <div className="flex justify-between items-center mt-4">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-gray-500 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-primary-500" />
                  {isMasterplanGenerated ? 'Masterplan generated successfully!' : 'Your conversation builds a comprehensive masterplan'}
                </motion.p>
                <button
                  onClick={resetConversation}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors group"
                >
                  <RotateCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                  Start over
                </button>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
