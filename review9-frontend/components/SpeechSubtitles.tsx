'use client';

import React from 'react';

interface SpeechSubtitlesProps {
  text: string;
  highlightIndex?: number;
  role: 'ai' | 'user';
  isInterim?: boolean;
}

export const SpeechSubtitles: React.FC<SpeechSubtitlesProps> = ({ text, highlightIndex = -1, role, isInterim }) => {
  if (!text) return null;

  const words = text.split(/\s+/);

  return (
    <div className={`fixed bottom-32 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-full px-6 transition-all duration-300`}>
      <div className={`p-6 rounded-3xl backdrop-blur-2xl border shadow-2xl ${
        role === 'ai' 
          ? 'bg-blue-600/90 border-blue-400 text-white' 
          : 'bg-black/80 border-white/10 text-gray-100'
      }`}>
        <div className="flex items-center space-x-2 mb-3">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${role === 'ai' ? 'bg-white' : 'bg-blue-400'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
            {role === 'ai' ? 'AI INTERVIEWER' : 'CANDIDATE SPEECH'}
            {isInterim && ' (PROCESSING...)'}
          </span>
        </div>
        
        <p className="text-lg font-bold leading-relaxed">
          {words.map((word, idx) => (
            <span 
              key={idx} 
              className={`mr-1.5 transition-all duration-200 ${
                role === 'ai' && idx <= highlightIndex 
                  ? 'text-white underline decoration-2 underline-offset-4' 
                  : role === 'ai' 
                    ? 'opacity-40' 
                    : isInterim 
                      ? 'text-blue-300' 
                      : 'text-white'
              }`}
            >
              {word}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
};
