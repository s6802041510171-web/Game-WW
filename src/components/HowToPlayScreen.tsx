import React from 'react';
import { Play, Shield, Award, Clock, Heart, Zap, Crosshair, HelpCircle, CheckCircle2, Lock, Sparkles, ChevronRight } from 'lucide-react';
import { GameDifficulty } from '../types';

interface HowToPlayScreenProps {
  difficulty: GameDifficulty;
  onSelectDifficulty: (difficulty: GameDifficulty) => void;
  onStartGame: () => void;
}

export const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({
  difficulty,
  onSelectDifficulty,
  onStartGame
}) => {
  return (
    <div className="relative z-10 min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-4 max-w-5xl mx-auto my-auto animate-fade-in font-mono">
      
      <div className="w-full max-w-3xl bg-[#0a0a0a] border border-red-900/50 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-2 bg-[#080808] border border-red-600/60 text-red-500 mb-2">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight font-['JetBrains_Mono',monospace]">
            OPERATING MANUAL // HOW TO PLAY
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 font-['Kanit',sans-serif]">
            ศึกษากฎเกณฑ์ระบบรักษาความปลอดภัย 3 Zones ก่อนเริ่มกู้คืนระบบและหาทางหลบหนี
          </p>
        </div>

        {/* 3 Zones & Maze Mechanics Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> MAZE NAVIGATION & CHEST SECURITY (3 ZONES):
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Zone 1 */}
            <div className="p-4 bg-[#080808] border border-red-900/30 space-y-1.5">
              <div className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-between">
                <span>ZONE 01</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">1 KEY</span>
              </div>
              <h4 className="text-sm font-bold text-white uppercase">External Breach</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed font-['Kanit',sans-serif]">
                เดินสำรวจเขาวงกต ตอบคำถามเปิดกล่องค้นหา <strong>Access Keycard Level 1</strong> และ Medkit เพื่อเปิดประตูปลดล็อก Zone 1
              </p>
            </div>

            {/* Zone 2 */}
            <div className="p-4 bg-[#080808] border border-red-900/30 space-y-1.5">
              <div className="text-xs font-mono font-bold text-cyan-400 flex items-center justify-between">
                <span>ZONE 02</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase">2 TOKENS</span>
              </div>
              <h4 className="text-sm font-bold text-white uppercase">Inner Data Vault</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed font-['Kanit',sans-serif]">
                เขาวงกตซับซ้อนขึ้น ต้องสะสม <strong>Encryption Fragments ทั้ง 2 ชิ้น</strong> ระวังกล่องขยะข้อมูลที่นำมาใช้ไม่ได้
              </p>
            </div>

            {/* Zone 3 */}
            <div className="p-4 bg-[#080808] border border-red-900/30 space-y-1.5">
              <div className="text-xs font-mono font-bold text-red-500 flex items-center justify-between">
                <span>ZONE 03</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-red-950 text-red-400 border border-red-800 uppercase">MASTER CORE</span>
              </div>
              <h4 className="text-sm font-bold text-white uppercase">Core Server Vault</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed font-['Kanit',sans-serif]">
                ด่านสุดท้าย! ค้นหา <strong>Master Core Passcode</strong> เพื่อเปิดประตู escape หนีออกจาก Data Center สำเร็จ
              </p>
            </div>

          </div>
        </div>

        {/* Gameplay Rules Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Rules / HP / Time */}
          <div className="p-4 bg-[#080808] border border-red-900/30 space-y-2 text-xs">
            <h3 className="font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Heart className="w-4 h-4 text-red-600 fill-red-600" /> CYBER HP & TIMER PROTOCOL:
            </h3>
            <ul className="space-y-1.5 text-gray-300 font-['Kanit',sans-serif]">
              <li className="flex items-start gap-1.5">
                <span className="text-red-500 font-bold">•</span>
                <span>คุณมี <strong>Cyber HP 3 ดวง</strong> หากตอบผิดจะเสีย HP 1 ดวง</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>มีเวลาจำกัด</strong> ต่อข้อ (45-60 วินาที) ยิ่งตอบเร็วจะได้รับ <strong>โบนัสเวลา</strong> เพิ่มขึ้น</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">•</span>
                <span>สามารถใช้ <strong>System Hint (คำใบ้)</strong> ช่วยวิเคราะห์ได้</span>
              </li>
            </ul>
          </div>

          {/* Badges System */}
          <div className="p-4 bg-[#080808] border border-red-900/30 space-y-2 text-xs">
            <h3 className="font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Award className="w-4 h-4 text-purple-400" /> HONOR BADGES (3 BADGES):
            </h3>
            <div className="space-y-1.5 text-gray-300 font-['Kanit',sans-serif]">
              <div className="flex items-center space-x-2">
                <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span><strong>Novice Shield:</strong> ผ่าน Zone 1</span>
              </div>
              <div className="flex items-center space-x-2">
                <Crosshair className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong>Threat Hunter:</strong> คะแนนรวมผ่าน 70%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span><strong>Cyber Legend:</strong> คะแนน 100% หรือ HP ไม่ลดเลย</span>
              </div>
            </div>
          </div>

        </div>

        {/* Mode Selector */}
        <div className="p-4 bg-[#080808] border border-red-900/30 space-y-3 font-mono">
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-widest">
            PROTOCOL DIFFICULTY:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Normal */}
            <button
              onClick={() => onSelectDifficulty('normal')}
              className={`p-3.5 border text-left transition-all ${
                difficulty === 'normal'
                  ? 'bg-red-950/30 border-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'bg-[#0f0f0f] border-red-900/30 text-gray-400 hover:border-red-600 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold text-white uppercase flex items-center justify-between">
                <span>NORMAL PROTOCOL</span>
                {difficulty === 'normal' && <CheckCircle2 className="w-4 h-4 text-red-500" />}
              </div>
              <p className="text-[11px] text-gray-400 mt-1 font-['Kanit',sans-serif]">
                เวลา 60s ต่อข้อ • คำใบ้ 2 ครั้ง • เหมาะสำหรับผู้เริ่มต้นเรียนรู้
              </p>
            </button>

            {/* Hardcore */}
            <button
              onClick={() => onSelectDifficulty('hardcore')}
              className={`p-3.5 border text-left transition-all ${
                difficulty === 'hardcore'
                  ? 'bg-red-950/50 border-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                  : 'bg-[#0f0f0f] border-red-900/30 text-gray-400 hover:border-red-600 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold text-red-500 uppercase flex items-center justify-between">
                <span>HARDCORE BREACH</span>
                {difficulty === 'hardcore' && <CheckCircle2 className="w-4 h-4 text-red-500" />}
              </div>
              <p className="text-[11px] text-gray-400 mt-1 font-['Kanit',sans-serif]">
                เวลา 45s ต่อข้อ • คำใบ้ 1 ครั้ง • คะแนนโบนัส +20%
              </p>
            </button>

          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            onClick={onStartGame}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white border border-red-400 font-extrabold text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center space-x-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>[EXECUTE & INITIATE SURVIVAL]</span>
          </button>
        </div>

      </div>

    </div>
  );
};
