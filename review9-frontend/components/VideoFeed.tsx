import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Radio } from 'lucide-react';

interface VideoFeedProps {
  isCamOn: boolean;
  isMicOn: boolean;
  userName: string;
  isAITalking: boolean;
  isListening: boolean;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({ isCamOn, isMicOn, userName, isAITalking, isListening }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    if (isCamOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          currentStream = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => console.error("Media access denied:", err));
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCamOn]);

  return (
    <div className="flex-grow bg-[#1a1c1e] rounded-[2.5rem] relative overflow-hidden flex items-center justify-center border border-white/5 group shadow-2xl transition-all duration-500">
      {isCamOn ? (
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-5xl font-black shadow-2xl text-white">
          {userName?.[0]}
        </div>
      )}

      {/* Identity Tag */}
      <div className="absolute bottom-6 left-6 flex items-center space-x-3 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-2xl text-sm border border-white/10 shadow-lg">
        {isMicOn ? (
          <Mic className="w-4 h-4 text-blue-400" />
        ) : (
          <MicOff className="w-4 h-4 text-red-500" />
        )}
        <span className="font-bold text-gray-200 tracking-tight">{userName}</span>
      </div>

      {/* Listening Waveform-like indicator */}
      {isListening && !isAITalking && (
        <div className="absolute top-6 right-6 flex items-center space-x-3 bg-blue-600/20 backdrop-blur-xl px-5 py-2.5 rounded-full border border-blue-500/30 shadow-lg animate-in fade-in zoom-in duration-300">
          <div className="flex items-center space-x-1">
            <div className="w-1 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-5 bg-blue-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-1 h-3 bg-blue-400 rounded-full animate-pulse delay-150"></div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Listening</span>
        </div>
      )}

      {/* Subtle border glow when AI is talking or Listening */}
      {(isAITalking || isListening) && (
        <div className={`absolute inset-0 border-2 rounded-[2.5rem] pointer-events-none transition-opacity duration-500 ${isAITalking ? 'border-blue-500/40 opacity-100' : 'border-blue-400/20 opacity-50'}`}></div>
      )}
    </div>
  );
};
