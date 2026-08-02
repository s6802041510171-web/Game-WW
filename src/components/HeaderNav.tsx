import React from 'react';
import { Shield, Volume2, VolumeX, Trophy, Code, Home, UserCheck, AlertTriangle } from 'lucide-react';
import { AgentInfo, ScreenType } from '../types';

interface HeaderNavProps {
  currentScreen: ScreenType;
  agentInfo: AgentInfo | null;
  hp: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onNavigate: (screen: ScreenType) => void;
  onOpenAppsScript: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentScreen,
  agentInfo,
  hp,
  isMuted,
  onToggleMute,
  onNavigate,
  onOpenAppsScript
}) => {
  return (
    <header className="relative z-20 w-full bg-[#0a0a0a]/90 backdrop-blur-md border-b border-red-900/50 px-4 py-3 sticky top-0 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand / Logo */}
        <button
          onClick={() => onNavigate('start')}
          className="flex items-center space-x-3 group text-left focus:outline-none"
        >
          <div className="p-2 bg-[#080808] border border-red-600/60 text-red-500 group-hover:border-red-500 group-hover:shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all">
            <Shield className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-red-500 font-mono tracking-[0.2em] uppercase">AGENT TERMINAL</div>
            <div className="text-sm sm:text-base font-bold tracking-tight text-white uppercase flex items-center gap-2 font-mono">
              CYBER NIGHTMARE
              <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 bg-red-950 text-red-400 border border-red-600/50 font-mono tracking-widest">
                ZONE ACTIVE
              </span>
            </div>
          </div>
        </button>

        {/* Agent Info & HP Status in Header if in game */}
        {agentInfo && (currentScreen === 'game' || currentScreen === 'summary') && (
          <div className="hidden md:flex items-center space-x-3 px-3.5 py-1.5 bg-[#080808] border border-red-900/30">
            <div className="flex items-center space-x-2 text-xs font-mono">
              <UserCheck className="w-3.5 h-3.5 text-red-500" />
              <span className="text-white font-bold tracking-wide">{agentInfo.nickname}</span>
              <span className="text-red-900">|</span>
              <span className="text-gray-400">{agentInfo.studentId}</span>
            </div>

            {/* HP Hearts Indicator */}
            {currentScreen === 'game' && (
              <div className="flex items-center space-x-1 pl-3 border-l border-red-900/40">
                {[1, 2, 3].map((heartIndex) => (
                  <span
                    key={heartIndex}
                    className={`text-base transition-transform duration-300 ${
                      heartIndex <= hp ? 'text-red-600 scale-100 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-gray-800 scale-90'
                    }`}
                  >
                    ❤
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          
          {/* Mute Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
            className="p-2 bg-[#0f0f0f] border border-red-900/30 hover:border-red-600 text-gray-400 hover:text-white transition-colors font-mono"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-gray-600" /> : <Volume2 className="w-4 h-4 text-red-500" />}
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={() => onNavigate('leaderboard')}
            className={`p-2 sm:px-3 sm:py-2 text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors border ${
              currentScreen === 'leaderboard'
                ? 'bg-red-950/60 text-red-400 border-red-600 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                : 'bg-[#0f0f0f] text-gray-300 border-red-900/30 hover:border-red-600 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline uppercase tracking-wider">Leaderboard</span>
          </button>

          {/* Google Apps Script Integration */}
          <button
            onClick={onOpenAppsScript}
            className="p-2 sm:px-3 sm:py-2 text-xs font-mono font-bold flex items-center space-x-1.5 bg-[#0f0f0f] hover:bg-red-950/20 text-cyan-400 border border-cyan-900/40 hover:border-cyan-500 transition-colors"
          >
            <Code className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline uppercase tracking-wider">GAS API</span>
          </button>

          {/* Return Home */}
          {currentScreen !== 'start' && (
            <button
              onClick={() => onNavigate('start')}
              className="p-2 bg-[#0f0f0f] border border-red-900/30 hover:border-red-600 text-gray-400 hover:text-white transition-colors"
              title="กลับหน้าหลัก"
            >
              <Home className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
