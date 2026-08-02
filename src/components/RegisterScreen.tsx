import React, { useState } from 'react';
import { UserCheck, Shield, Sparkles, AlertCircle, ArrowRight, Bot, Key, Bookmark, CheckCircle2 } from 'lucide-react';
import { AgentInfo } from '../types';

interface RegisterScreenProps {
  initialAgent: AgentInfo | null;
  onSaveAgent: (agent: AgentInfo) => void;
  onNavigateToHowToPlay: () => void;
}

const AVATAR_OPTIONS = [
  { id: 'cyber-ninja', name: 'Cyber Ninja', role: 'Infiltration Specialist', color: 'text-red-400 border-red-500/40 bg-red-950/40' },
  { id: 'net-sentinel', name: 'Net Sentinel', role: 'Firewall Defender', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40' },
  { id: 'cryptographer', name: 'Cryptographer X', role: 'Encryption Master', color: 'text-purple-400 border-purple-500/40 bg-purple-950/40' },
  { id: 'glitch-hunter', name: 'Glitch Hunter', role: 'Bug & Vulnerability Hunter', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' },
];

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  initialAgent,
  onSaveAgent,
  onNavigateToHowToPlay
}) => {
  const [fullName, setFullName] = useState(initialAgent?.fullName || '');
  const [studentId, setStudentId] = useState(initialAgent?.studentId || '');
  const [classGroup, setClassGroup] = useState(initialAgent?.classGroup || 'SEC-1A');
  const [nickname, setNickname] = useState(initialAgent?.nickname || '');
  const [avatarId, setAvatarId] = useState(initialAgent?.avatarId || 'cyber-ninja');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) newErrors.fullName = 'กรุณากรอกชื่อ-นามสกุล';
    if (!studentId.trim()) newErrors.studentId = 'กรุณากรอกรหัสนักศึกษา';
    if (!classGroup.trim()) newErrors.classGroup = 'กรุณากรอกกลุ่มเรียน';
    if (!nickname.trim()) newErrors.nickname = 'กรุณากรอกชื่อเล่น/Agent ID';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const agent: AgentInfo = {
      fullName: fullName.trim(),
      studentId: studentId.trim(),
      classGroup: classGroup.trim(),
      nickname: nickname.trim(),
      avatarId
    };

    onSaveAgent(agent);
    onNavigateToHowToPlay();
  };

  return (
    <div className="relative z-10 min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-4 max-w-4xl mx-auto my-auto animate-fade-in font-mono">
      
      <div className="w-full max-w-xl bg-[#0a0a0a] border border-red-900/50 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Title Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-2 bg-[#080808] border border-red-600/60 text-red-500 mb-2">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight font-['JetBrains_Mono',monospace]">
            AGENT REGISTRATION
          </h2>
          <p className="text-xs text-gray-400 font-['Kanit',sans-serif]">
            ลงทะเบียนข้อมูล Agent ผู้เอาชีวิตรอดเพื่อบันทึกผลการเข้าเรียนในระบบ Google Sheets
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={validateAndSubmit} className="space-y-4">
          
          {/* Grid Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Student ID */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1.5 font-['Kanit',sans-serif]">
                <Key className="w-3.5 h-3.5 text-red-500" />
                รหัสนักศึกษา *
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  if (errors.studentId) setErrors((prev) => ({ ...prev, studentId: '' }));
                }}
                placeholder="เช่น 6802041510001"
                className="w-full px-3.5 py-2.5 bg-[#080808] border border-red-900/40 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors font-mono"
              />
              {errors.studentId && (
                <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1 font-['Kanit',sans-serif]">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {errors.studentId}
                </p>
              )}
            </div>

            {/* Class Group */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1.5 font-['Kanit',sans-serif]">
                <Bookmark className="w-3.5 h-3.5 text-red-500" />
                กลุ่มเรียน (Class Group) *
              </label>
              <select
                value={classGroup}
                onChange={(e) => setClassGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#080808] border border-red-900/40 text-xs sm:text-sm text-white focus:outline-none focus:border-red-600 transition-colors font-mono"
              >
                <option value="SEC-1A">SEC-1A (กลุ่ม 1)</option>
                <option value="SEC-1B">SEC-1B (กลุ่ม 2)</option>
                <option value="SEC-2A">SEC-2A (กลุ่ม 3)</option>
                <option value="SEC-2B">SEC-2B (กลุ่ม 4)</option>
                <option value="OTHER">กลุ่มอื่นๆ / ทั่วไป</option>
              </select>
            </div>

            {/* Full Name */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 font-['Kanit',sans-serif]">
                ชื่อ - นามสกุล *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                }}
                placeholder="เช่น นายพงศกร สุขสวัสดิ์"
                className="w-full px-3.5 py-2.5 bg-[#080808] border border-red-900/40 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors font-['Kanit',sans-serif]"
              />
              {errors.fullName && (
                <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1 font-['Kanit',sans-serif]">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {errors.fullName}
                </p>
              )}
            </div>

            {/* Agent Call Sign / Nickname */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 flex items-center justify-between font-['Kanit',sans-serif]">
                <span>ชื่อเล่น / Agent Call Sign (แสดงในเกม) *</span>
                <span className="text-[10px] text-gray-500 font-mono">Leaderboard Alias</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  if (errors.nickname) setErrors((prev) => ({ ...prev, nickname: '' }));
                }}
                placeholder="เช่น CyberNinja, NetSentinel, Agent_007"
                className="w-full px-3.5 py-2.5 bg-[#080808] border border-red-900/40 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors font-mono"
              />
              {errors.nickname && (
                <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1 font-['Kanit',sans-serif]">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {errors.nickname}
                </p>
              )}
            </div>

          </div>

          {/* Avatar Selector */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-gray-300 font-['Kanit',sans-serif]">
              เลือกสายอาชีพ / Agent Specialization:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AVATAR_OPTIONS.map((avatar) => {
                const isSelected = avatarId === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setAvatarId(avatar.id)}
                    className={`p-3 border text-left transition-all relative overflow-hidden flex items-center space-x-2.5 ${
                      isSelected
                        ? 'bg-red-950/30 border-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                        : 'bg-[#080808] border-red-900/30 text-gray-400 hover:border-red-600 hover:text-white'
                    }`}
                  >
                    <div className="p-2 bg-[#0f0f0f] border border-red-900/40 shrink-0">
                      <Bot className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold font-mono text-white flex items-center gap-1 uppercase">
                        {avatar.name}
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">{avatar.role}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center space-x-2"
            >
              <span>[REGISTER AGENT & PROCEED]</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
