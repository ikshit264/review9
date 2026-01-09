'use client';

import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@/types';

interface TranscriptSidebarProps {
  chat: ChatMessage[];
  plan: string;
  interimText: string;
  onTextChange: (text: string) => void;
  onSubmit: (text: string) => void;
  isAnalyzing: boolean;
  isSTTProcessing: boolean;
  isMicActive: boolean;
  isAITalking?: boolean;
  aiActiveText?: string;
  aiHighlightIndex?: number;
  noTextTyping?: boolean;
}

export const TranscriptSidebar: React.FC<TranscriptSidebarProps> = ({
  chat,
  plan,
  interimText,
  onTextChange,
  onSubmit,
  isAnalyzing,
  isSTTProcessing,
  isMicActive,
  isAITalking,
  aiActiveText,
  aiHighlightIndex = -1,
  noTextTyping = false
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, aiActiveText]);

  const renderMessageContent = (m: ChatMessage, isLatest: boolean) => {
    if (m.role === 'ai' && isLatest && isAITalking && aiActiveText) {
      const words = m.text.split(' ');
      return (
        <div className="flex flex-wrap gap-1">
          {words.map((word, idx) => (
            <span
              key={`${m.id}-${idx}`}
              className={`transition-colors duration-200 ${idx === aiHighlightIndex
                ? 'text-blue-400 font-bold scale-110'
                : 'text-gray-100'
                }`}
            >
              {word}
            </span>
          ))}
        </div>
      );
    }
    return m.text;
  };

  return (
    <div className="flex-grow bg-[#202124] rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl">
      <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          <span className="text-xs font-black uppercase tracking-widest text-gray-300">Session Transcript</span>
        </div>
        <span className="text-[10px] bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 py-1 rounded-full font-black uppercase tracking-tighter">{plan}</span>
      </div>

      <div
        ref={scrollRef}
        className="flex-grow p-6 overflow-y-auto space-y-6 scroll-smooth custom-scrollbar"
      >
        {chat.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-50">
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-bold max-w-[200px]">Transcript will appear once you begin the interview.</p>
          </div>
        )}

        {chat.map((m, index) => {
          const isLatest = index === chat.length - 1;
          return (
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start animate-in fade-in slide-in-from-left-2 duration-300'}`}>
              <div className="flex items-center space-x-2 mb-1.5">
                {m.role === 'ai' && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>}
                <span className={`text-[10px] font-black tracking-widest uppercase ${m.role === 'ai' ? 'text-blue-400' : 'text-gray-500'}`}>
                  {m.role === 'ai' ? 'IntervAI Assistant' : 'You (Candidate)'}
                </span>
              </div>
              <div className={`p-4 rounded-2xl text-[13px] leading-relaxed max-w-[85%] shadow-xl transition-all ${m.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-[#3c4043] text-gray-100 rounded-tl-none border border-white/5 hover:bg-[#4a4e51]'
                }`}>
                {renderMessageContent(m, isLatest)}
                <div className={`mt-2 text-[8px] font-bold opacity-40 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {chat.length > 0 && (
        <div className="px-4 py-2 bg-black/10 border-t border-white/5 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Live transcript Active</span>
        </div>
      )}

      {/* Inline Input Area */}
      <div className="p-4 bg-[#2c2e31] border-t border-white/5">
        <div className="relative group">
          <textarea
            value={interimText}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (interimText.trim().length >= 2 && !isSTTProcessing && !isAnalyzing && !noTextTyping) {
                  onSubmit(interimText.trim());
                }
              }
            }}
            placeholder={noTextTyping ? "Typing is disabled for this interview." : isMicActive ? "Speaking... (or type here)" : "Wait for your turn..."}
            disabled={!isMicActive || isAnalyzing || noTextTyping}
            className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none min-h-[80px] transition-all disabled:opacity-50"
          />

          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
            {isSTTProcessing && (
              <div className="flex space-x-1 mr-2">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            )}
            <button
              onClick={() => onSubmit(interimText.trim())}
              disabled={interimText.trim().length < 2 || isSTTProcessing || isAnalyzing || !isMicActive}
              className={`p-2 rounded-xl transition-all ${interimText.trim().length >= 2 && !isSTTProcessing && !isAnalyzing && isMicActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:scale-105'
                : 'bg-white/5 text-gray-600'
                }`}
            >
              {isAnalyzing ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              )}
            </button>
          </div>
        </div>
        <p className="mt-2 text-[9px] font-bold text-gray-600 uppercase tracking-widest text-center">
          {noTextTyping ? "Please answer verbally only" : isSTTProcessing ? "Wait for speech to finish..." : "Press Enter to send"}
        </p>
      </div>
    </div>
  );
};
