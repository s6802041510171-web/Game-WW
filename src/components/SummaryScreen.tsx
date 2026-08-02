import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, Shield, Trophy, RefreshCw, CheckCircle2, XCircle, Clock, UserCheck, ExternalLink, Code, Sparkles, BookOpen, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { AgentInfo, GameResultPayload, Badge, AnswerLog } from '../types';
import { playVictorySound } from '../utils/sound';

interface SummaryScreenProps {
  agentInfo: AgentInfo;
  score: number;
  maxScore: number;
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  difficulty: string;
  endReason: 'cleared' | 'hp_zero';
  badges: Badge[];
  answerLogs: AnswerLog[];
  syncStatus: { success: boolean; message: string; isCachedLocally?: boolean };
  gasUrl: string;
  onRetrySync: () => void;
  onNavigateToLeaderboard: () => void;
  onOpenAppsScript: () => void;
  onPlayAgain: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({
  agentInfo,
  score,
  maxScore,
  correctCount,
  incorrectCount,
  totalQuestions,
  timeSpentSeconds,
  difficulty,
  endReason,
  badges,
  answerLogs,
  syncStatus,
  gasUrl,
  onRetrySync,
  onNavigateToLeaderboard,
  onOpenAppsScript,
  onPlayAgain
}) => {
  const [showReview, setShowReview] = useState(false);

  const percentage = Math.round((score / maxScore) * 100);

  // Determine Survival Status Rank
  let finalStatus = 'INFECTED OPERATIVE';
  let statusColor = 'text-red-400 bg-red-950/60 border-red-500/40';

  if (percentage >= 90) {
    finalStatus = 'ELITE CYBER DEFENDER';
    statusColor = 'text-purple-400 bg-purple-950/60 border-purple-500/40';
  } else if (percentage >= 70) {
    finalStatus = 'SURVIVOR';
    statusColor = 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40';
  } else if (percentage >= 50) {
    finalStatus = 'RECOVERED OPERATIVE';
    statusColor = 'text-amber-400 bg-amber-950/60 border-amber-500/40';
  }

  // Trigger celebratory confetti if passed
  useEffect(() => {
    if (percentage >= 70 || endReason === 'cleared') {
      playVictorySound();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log('Confetti failed', err);
      }
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} นาที ${secs} วินาที`;
  };

  return (
    <div className="relative z-10 min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-4 max-w-4xl mx-auto my-auto animate-fade-in space-y-6 font-mono">
      
      {/* Main Summary Card */}
      <div className="w-full bg-[#0a0a0a] border border-red-900/50 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Top Agent ID & Status Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#080808] border border-red-900/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#0f0f0f] border border-red-600/60 text-red-500">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-red-500 font-mono uppercase tracking-widest">AGENT CALL SIGN:</div>
              <div className="text-base font-bold text-white font-mono flex items-center gap-2">
                {agentInfo.nickname}
                <span className="text-xs font-normal text-gray-400">({agentInfo.studentId})</span>
              </div>
              <div className="text-[11px] text-gray-400 font-['Kanit',sans-serif]">{agentInfo.fullName} • {agentInfo.classGroup}</div>
            </div>
          </div>

          <div className={`px-4 py-2 border text-xs font-mono font-bold text-center uppercase tracking-wider ${statusColor}`}>
            <div className="text-[10px] opacity-80">SURVIVAL STATUS:</div>
            <div className="text-sm sm:text-base mt-0.5">{finalStatus}</div>
          </div>
        </div>

        {/* Score Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
          
          <div className="p-3.5 bg-[#080808] border border-red-900/30 space-y-1">
            <div className="text-[10px] text-red-500 uppercase tracking-widest">Data Points</div>
            <div className="text-xl sm:text-2xl font-bold text-white">{score}</div>
            <div className="text-[10px] text-gray-500">MAX {maxScore}</div>
          </div>

          <div className="p-3.5 bg-[#080808] border border-red-900/30 space-y-1">
            <div className="text-[10px] text-red-500 uppercase tracking-widest">Accuracy</div>
            <div className="text-xl sm:text-2xl font-bold text-amber-400">{percentage}%</div>
            <div className="text-[10px] text-gray-500">{percentage >= 70 ? 'PASSED' : 'NEED REVIEW'}</div>
          </div>

          <div className="p-3.5 bg-[#080808] border border-red-900/30 space-y-1">
            <div className="text-[10px] text-red-500 uppercase tracking-widest">Correct / Error</div>
            <div className="text-base sm:text-lg font-bold text-emerald-400">
              {correctCount} <span className="text-gray-600">/</span> <span className="text-red-500">{incorrectCount}</span>
            </div>
            <div className="text-[10px] text-gray-500">TOTAL {totalQuestions}</div>
          </div>

          <div className="p-3.5 bg-[#080808] border border-red-900/30 space-y-1">
            <div className="text-[10px] text-red-500 uppercase tracking-widest">Duration</div>
            <div className="text-xs sm:text-sm font-bold text-purple-400 pt-1">{formatTime(timeSpentSeconds)}</div>
            <div className="text-[10px] text-gray-500">{difficulty.toUpperCase()}</div>
          </div>

        </div>

        {/* Badges Earned Showcase */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-red-500 uppercase font-mono tracking-widest flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" /> HONOR BADGES:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3.5 border transition-all flex items-start space-x-3 ${
                  badge.unlocked
                    ? 'bg-red-950/20 border-red-600/80 text-white shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                    : 'bg-[#080808] border-gray-900 text-gray-600 opacity-50'
                }`}
              >
                <div className={`p-2 shrink-0 border ${badge.unlocked ? 'bg-red-950 border-red-600 text-amber-400' : 'bg-[#0f0f0f] border-gray-800 text-gray-700'}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold font-mono text-white uppercase flex items-center gap-1">
                    {badge.title}
                    {badge.unlocked && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed font-['Kanit',sans-serif]">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Feedback & Encouragement */}
        <div className="p-4 bg-[#080808] border border-red-900/30 space-y-2 text-xs font-['Kanit',sans-serif]">
          <h4 className="font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
            <BookOpen className="w-4 h-4 text-red-500" /> ANALYSIS SUMMARY & RECOMMENDATIONS:
          </h4>
          <p className="text-gray-300 leading-relaxed">
            {percentage >= 90
              ? 'ยอดเยี่ยมมาก! คุณมีความรู้ความเข้าใจด้าน Cybersecurity ระดับผู้เชี่ยวชาญ สามารถรับมือกับภัยคุกคามในสถานการณ์จริงได้อย่างมั่นใจ!'
              : percentage >= 70
              ? 'ทำได้ดีมาก! คุณผ่านเกณฑ์การเอาชีวิตรอดไซเบอร์ ทบทวนเรื่อง Incident Response และ Zero Trust เพิ่มเติมเพื่อความเป็นเลิศ!'
              : 'พยายามได้ดี! Cybersecurity เป็นเรื่องที่ต้องหมั่นฝึกฝนทบทวนเรื่อง Phishing, Password Security และการจัดการกับ Ransomware เพื่อให้พร้อมรับมือในรอบถัดไป!'}
          </p>
        </div>

        {/* Google Sheets Sync Status Box */}
        <div className="p-3.5 bg-[#080808] border border-red-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-gray-300">{syncStatus.message}</span>
          </div>
          <button
            onClick={onRetrySync}
            className="px-3 py-1.5 bg-[#0f0f0f] hover:bg-red-950/20 text-gray-300 border border-red-900/40 text-[11px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 uppercase"
          >
            <RefreshCw className="w-3 h-3 text-red-500" />
            <span>Retry Sync</span>
          </button>
        </div>

        {/* Detailed Question Review Toggle */}
        <div className="border-t border-red-900/30 pt-4">
          <button
            onClick={() => setShowReview(!showReview)}
            className="w-full py-2.5 px-4 bg-[#080808] hover:bg-[#0f0f0f] border border-red-900/30 text-xs font-mono font-bold text-gray-300 flex items-center justify-between transition-colors uppercase tracking-wider"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-red-500" />
              REVIEW ANSWER LOGS ({answerLogs.length} Questions)
            </span>
            {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showReview && (
            <div className="mt-3 space-y-3 max-h-96 overflow-y-auto pr-1 animate-fade-in font-['Kanit',sans-serif]">
              {answerLogs.map((log, i) => (
                <div
                  key={i}
                  className={`p-3.5 border text-xs space-y-1.5 ${
                    log.isCorrect ? 'bg-[#080808] border-emerald-500/40' : 'bg-[#080808] border-red-600/40'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-bold text-[11px]">
                    <span className="text-gray-400">LOG #{i + 1}:</span>
                    <span className={log.isCorrect ? 'text-emerald-400' : 'text-red-500'}>
                      {log.isCorrect ? 'SUCCESS' : 'BREACH / TIMEOUT'} (+{log.pointsEarned} PT)
                    </span>
                  </div>
                  <p className="font-semibold text-gray-200">{log.questionText}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold border border-red-400 text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>[RESTART PROTOCOL]</span>
          </button>

          <button
            onClick={onNavigateToLeaderboard}
            className="flex-1 py-3.5 bg-[#0f0f0f] hover:bg-red-950/20 text-amber-400 font-bold border border-red-900/40 hover:border-red-600 text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center space-x-2"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>[LEADERBOARD]</span>
          </button>

          <button
            onClick={onOpenAppsScript}
            className="py-3.5 px-4 bg-[#080808] hover:bg-red-950/20 text-gray-300 font-bold text-xs uppercase tracking-wider border border-red-900/40 transition-all flex items-center justify-center space-x-1.5"
          >
            <Code className="w-4 h-4 text-red-500" />
            <span>[GAS SCRIPT]</span>
          </button>

        </div>

      </div>

    </div>
  );
};
