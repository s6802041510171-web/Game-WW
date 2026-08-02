import React from 'react';
import { Shield, Play, HelpCircle, Terminal, AlertCircle, Skull, Cpu, Lock, Trophy } from 'lucide-react';
import { ScreenType } from '../types';

interface StartScreenProps {
  onNavigate: (screen: ScreenType) => void;
  hasExistingAgent: boolean;
  registeredNickname?: string;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onNavigate,
  hasExistingAgent,
  registeredNickname
}) => {
  return (
    <div className="relative z-10 min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-4 max-w-5xl mx-auto my-auto animate-fade-in font-mono">
      
      {/* Alert Banner / Horror Glitch Ribbon */}
      <div className="w-full max-w-2xl mb-6 p-3 bg-red-950/60 border border-red-600/50 text-red-400 flex items-center justify-between text-xs font-mono backdrop-blur-sm animate-pulse">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span className="uppercase tracking-widest">[ALERT] SYSTEM INTEGRITY AT 42% - UNAUTHORIZED BREACH DETECTED</span>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 bg-red-600 text-black text-[10px] font-black uppercase tracking-wider">
          SEGMENT 7B
        </span>
      </div>

      {/* Main Hero Card */}
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-red-900/50 p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center space-y-6">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Shield Icon Emblem */}
        <div className="relative inline-block">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-[#080808] border-2 border-red-600 flex items-center justify-center text-red-500 shadow-[0_0_25px_rgba(239,68,68,0.2)] group transform hover:scale-105 transition-all">
            <Shield className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse filter drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
            <Skull className="w-5 h-5 text-red-500 absolute bottom-2 right-2 opacity-90" />
          </div>
          <div className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
          </div>
        </div>

        {/* Game Title */}
        <div className="space-y-2">
          <div className="text-[10px] text-red-500 tracking-[0.3em] uppercase">SURVIVAL PROTOCOL // ZONE 02 ACTIVE</div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase italic font-['JetBrains_Mono',monospace]">
            CYBER NIGHTMARE
          </h1>
          <p className="text-xs sm:text-sm font-bold text-red-500 tracking-widest uppercase">
            Cybersecurity Escape Room Simulation
          </p>
        </div>

        {/* Storyboard Briefing */}
        <div className="p-4 bg-[#080808] border border-red-900/30 text-gray-300 text-xs sm:text-sm leading-relaxed text-left space-y-2 font-['Kanit',sans-serif]">
          <div className="flex items-center space-x-2 text-red-500 font-mono text-xs font-bold uppercase tracking-widest border-b border-red-900/30 pb-1.5">
            <Terminal className="w-4 h-4 text-red-500" />
            <span>MISSION BRIEFING // OPERATIVE DIRECTIVE:</span>
          </div>
          <p>
            คุณเป็นเจ้าหน้าที่ไอทีที่ติดอยู่ใน <strong className="text-red-500">Dark Data Center</strong> ขององค์กรร้าง มัลแวร์ปริศนาและแฮกเกอร์สายมืดได้เข้ายึดครองระบบเซิร์ฟเวอร์ทั้งหมด ระบบรักษาความปลอดภัยเกิดการ Breach และกำลังล็อคประตูทางออกทุกด่าน!
          </p>
          <p className="text-gray-400">
            ทางเดียวที่จะรอดชีวิตกลับออกไปได้ คือการตอบคำถามความปลอดภัยไซเบอร์ ปิดช่องโหว่ ปลูกเกราะป้องกันความปลอดภัยทั้ง 3 Zone ก่อนที่พิกัดจะถูกลบถาวร!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-stretch">
          
          <button
            onClick={() => onNavigate(hasExistingAgent ? 'game' : 'register')}
            className="px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white border border-red-400 font-extrabold text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center space-x-2.5"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{hasExistingAgent ? `[RESUME MISSION: ${registeredNickname}]` : '[INITIATE SURVIVAL PROTOCOL]'}</span>
          </button>

          <button
            onClick={() => onNavigate('how-to-play')}
            className="px-5 py-3.5 bg-[#0f0f0f] hover:bg-red-950/20 text-gray-300 border border-red-900/40 hover:border-red-600 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2"
          >
            <HelpCircle className="w-4 h-4 text-red-500" />
            <span>[OPERATING MANUAL]</span>
          </button>

        </div>

        {/* Quick Link Row */}
        <div className="pt-2 flex items-center justify-center gap-6 text-xs text-gray-400 font-mono">
          <button
            onClick={() => onNavigate('leaderboard')}
            className="hover:text-amber-400 flex items-center gap-1.5 transition-colors uppercase tracking-wider"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Leaderboard</span>
          </button>
          <span className="text-red-900">•</span>
          <button
            onClick={() => onNavigate('register')}
            className="hover:text-red-400 flex items-center gap-1.5 transition-colors uppercase tracking-wider"
          >
            <Cpu className="w-3.5 h-3.5 text-red-500" />
            <span>Register Agent</span>
          </button>
        </div>

      </div>

    </div>
  );
};
