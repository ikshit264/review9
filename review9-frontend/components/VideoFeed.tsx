import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Mic, MicOff, Radio } from 'lucide-react';

interface VideoFeedProps {
  isCamOn: boolean;
  isMicOn: boolean;
  userName: string;
  isAITalking: boolean;
  isListening: boolean;
  proctoringMetrics?: {
    faces: number;
    yaw: number;
    pitch: number;
  };
}

export const VideoFeed = React.memo(forwardRef<HTMLVideoElement, VideoFeedProps>(({ isCamOn, isMicOn, userName, isAITalking, isListening, proctoringMetrics }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync internal ref with forwarded ref
  useImperativeHandle(ref, () => videoRef.current!);

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
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center space-x-2 bg-blue-600/10 backdrop-blur-md px-3 py-1 rounded-full border border-blue-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Proctoring Active (Processed Locally)</span>
        </div>
      </div>

      {isCamOn && proctoringMetrics && (
        <div className="absolute top-6 right-6 z-10 flex flex-col space-y-2">
          {/* Live Integrity Monitor */}
          <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 flex flex-col space-y-1 self-end shadow-2xl">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Faces</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${proctoringMetrics.faces === 1 ? 'text-green-500' : 'text-red-500'}`}>
                {proctoringMetrics.faces}
              </span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Attention</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${(proctoringMetrics.yaw < 30 && proctoringMetrics.pitch < 25) ? 'text-green-500' : 'text-orange-500'}`}>
                {(proctoringMetrics.yaw < 30 && proctoringMetrics.pitch < 25) ? 'OPTIMAL' : 'DIVERTED'}
              </span>
            </div>
            {/* Subtle Gauges */}
            <div className="flex space-x-1 pt-1">
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${Math.min(proctoringMetrics.yaw, 100)}%` }}></div>
              </div>
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${Math.min(proctoringMetrics.pitch, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

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
}));

VideoFeed.displayName = 'VideoFeed';
