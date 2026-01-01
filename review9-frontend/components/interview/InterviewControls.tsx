import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface InterviewControlsProps {
  isMicOn: boolean;
  isCamOn: boolean;
  setIsMicOn: (val: boolean) => void;
  setIsCamOn: (val: boolean) => void;
  onEndCall: () => void;
  interviewStarted: boolean;
  onStart: () => void;
  currentStep: number;
  totalSteps: number;
}

export const InterviewControls: React.FC<InterviewControlsProps> = ({
  isMicOn, isCamOn, setIsMicOn, setIsCamOn, onEndCall, interviewStarted, onStart, currentStep, totalSteps
}) => {
  return (
    <div className="h-24 flex items-center justify-between px-10 bg-[#202124] border-t border-white/5">
      <div className="flex-1 text-sm font-medium text-gray-500">
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; Active Session
      </div>

      <div className="flex items-center space-x-6">
        <ControlBtn onClick={() => setIsMicOn(!isMicOn)} active={isMicOn}>
          {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </ControlBtn>
        <ControlBtn onClick={() => setIsCamOn(!isCamOn)} active={isCamOn}>
          {isCamOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </ControlBtn>
        <button
          className="bg-red-500 hover:bg-red-600 w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-red-500/20 transition-all active:scale-95"
          onClick={onEndCall}
          title="End Interview"
        >
          <PhoneOff className="w-7 h-7 text-white" />
        </button>
      </div>

      <div className="flex-1 flex justify-end">
        {!interviewStarted ? (
          <button
            onClick={onStart}
            className="bg-blue-600 hover:bg-blue-700 h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs text-white shadow-lg shadow-blue-500/20 transition-all"
          >
            Begin Interview
          </button>
        ) : (
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 text-xs font-bold text-blue-400">
            Question {currentStep + 1} of {totalSteps}
          </div>
        )}
      </div>
    </div>
  );
};

const ControlBtn: React.FC<{ children: React.ReactNode; onClick: () => void; active: boolean }> = ({ children, onClick, active }) => (
  <button
    onClick={onClick}
    className={`w-14 h-14 rounded-2xl border transition-all flex items-center justify-center ${active ? 'bg-white/5 text-white border-white/10 hover:bg-white/10' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'}`}
  >
    {children}
  </button>
);
