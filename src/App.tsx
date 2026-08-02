import React, { useState, useEffect } from 'react';
import {
  AgentInfo,
  ScreenType,
  GameDifficulty,
  Question,
  AnswerLog,
  Badge,
  GameResultPayload,
  LeaderboardEntry
} from './types';
import { QUESTION_BANK, BADGE_DEFINITIONS } from './data/questions';
import {
  DEFAULT_GAS_URL,
  submitGameDataToSheets,
  getLocalLeaderboard,
  fetchSheetsLeaderboard
} from './services/sheetsService';
import { toggleMute, getIsMuted } from './utils/sound';

import { HeaderNav } from './components/HeaderNav';
import { StartScreen } from './components/StartScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { HowToPlayScreen } from './components/HowToPlayScreen';
import { GameplayScreen } from './components/GameplayScreen';
import { MazeGameView } from './components/MazeGameView';
import { SummaryScreen } from './components/SummaryScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { AppsScriptModal } from './components/AppsScriptModal';
import { CyberBackground } from './components/CyberBackground';

const LOCAL_AGENT_KEY = 'CYBER_NIGHTMARE_AGENT_INFO';
const LOCAL_GAS_URL_KEY = 'CYBER_NIGHTMARE_GAS_URL';

export default function App() {
  // Navigation & Modal State
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('start');
  const [isAppsScriptModalOpen, setIsAppsScriptModalOpen] = useState(false);
  const [isMuted, setIsMutedState] = useState(getIsMuted());

  // Config & Saved Agent State
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_AGENT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [gasUrl, setGasUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_GAS_URL_KEY);
      return saved || DEFAULT_GAS_URL;
    } catch {
      return DEFAULT_GAS_URL;
    }
  });

  // Active Game Session State
  const [difficulty, setDifficulty] = useState<GameDifficulty>('normal');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [hp, setHp] = useState(3);
  const [score, setScore] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(2);
  const [answerLogs, setAnswerLogs] = useState<AnswerLog[]>([]);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [endReason, setEndReason] = useState<'cleared' | 'hp_zero'>('cleared');

  // Badges & Leaderboard State
  const [badges, setBadges] = useState<Badge[]>(BADGE_DEFINITIONS);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string; isCachedLocally?: boolean }>({
    success: true,
    message: 'ยังไม่ได้ส่งข้อมูล'
  });

  // Load Leaderboard from Google Sheets API & Local Storage
  const reloadLeaderboard = async () => {
    const liveEntries = await fetchSheetsLeaderboard('1UbRAZHJXDXJrYpYk99mKZxny6D6zD48Eldo8Zevl0EA');
    setLeaderboardEntries(liveEntries);
  };

  useEffect(() => {
    reloadLeaderboard();
  }, [currentScreen]);

  const handleToggleMute = () => {
    const muted = toggleMute();
    setIsMutedState(muted);
  };

  const handleSaveAgent = (agent: AgentInfo) => {
    setAgentInfo(agent);
    try {
      localStorage.setItem(LOCAL_AGENT_KEY, JSON.stringify(agent));
    } catch (err) {
      console.error('Failed to save agent to local storage', err);
    }
  };

  const handleUpdateGasUrl = (url: string) => {
    setGasUrl(url);
    try {
      localStorage.setItem(LOCAL_GAS_URL_KEY, url);
    } catch (err) {
      console.error('Failed to save gas url', err);
    }
  };

  // Prepare & Shuffle 10 questions from QUESTION_BANK (3 from Z1, 3 from Z2, 4 from Z3)
  const prepareGameQuestions = (): Question[] => {
    const zone1 = QUESTION_BANK.filter((q) => q.zone === 1).sort(() => Math.random() - 0.5).slice(0, 3);
    const zone2 = QUESTION_BANK.filter((q) => q.zone === 2).sort(() => Math.random() - 0.5).slice(0, 3);
    const zone3 = QUESTION_BANK.filter((q) => q.zone === 3).sort(() => Math.random() - 0.5).slice(0, 4);
    return [...zone1, ...zone2, ...zone3];
  };

  const handleStartGameSession = () => {
    const selected = prepareGameQuestions();
    setActiveQuestions(selected);
    setHp(3);
    setScore(0);
    setHintsLeft(difficulty === 'hardcore' ? 1 : 2);
    setAnswerLogs([]);
    setStartTime(new Date().toISOString());
    setBadges(BADGE_DEFINITIONS.map((b) => ({ ...b, unlocked: false })));
    setCurrentScreen('game');
  };

  const handleAnswerQuestion = (isCorrect: boolean, pointsEarned: number, log: AnswerLog) => {
    setAnswerLogs((prev) => [...prev, log]);

    if (isCorrect) {
      setScore((prev) => prev + pointsEarned);
    } else {
      setHp((prev) => Math.max(0, prev - 1));
    }
  };

  const handleUseHint = () => {
    setHintsLeft((prev) => Math.max(0, prev - 1));
  };

  const calculateMaxScore = (): number => {
    const multiplier = difficulty === 'hardcore' ? 1.2 : 1.0;
    const baseTotal = activeQuestions.reduce((sum, q) => sum + q.points + 50, 0); // includes max time bonus
    return Math.round(baseTotal * multiplier);
  };

  const handleEndGameSession = async (reason: 'cleared' | 'hp_zero') => {
    const end = new Date().toISOString();
    setEndTime(end);
    setEndReason(reason);

    const maxScoreVal = calculateMaxScore();
    const percentage = Math.round((score / maxScoreVal) * 100);

    const startMs = new Date(startTime).getTime();
    const endMs = new Date(end).getTime();
    const timeSpentSeconds = Math.max(1, Math.round((endMs - startMs) / 1000));

    // Calculate Badges Unlocks
    const updatedBadges = BADGE_DEFINITIONS.map((b) => {
      let isUnlocked = false;
      if (b.id === 'novice-shield') {
        // Unlocked if player answered at least 3 questions (Zone 1 cleared)
        isUnlocked = answerLogs.length >= 3;
      } else if (b.id === 'threat-hunter') {
        isUnlocked = percentage >= 70;
      } else if (b.id === 'cyber-legend') {
        isUnlocked = percentage === 100 || (hp === 3 && answerLogs.length >= 10);
      }
      return { ...b, unlocked: isUnlocked };
    });

    setBadges(updatedBadges);

    let finalStatusStr = 'INFECTED OPERATIVE';
    if (percentage >= 90) finalStatusStr = 'ELITE CYBER DEFENDER';
    else if (percentage >= 70) finalStatusStr = 'SURVIVOR';
    else if (percentage >= 50) finalStatusStr = 'RECOVERED OPERATIVE';

    const unlockedBadgeTitles = updatedBadges.filter((b) => b.unlocked).map((b) => b.title);

    const payload: GameResultPayload = {
      studentId: agentInfo?.studentId || '6802041510000',
      fullName: agentInfo?.fullName || 'Anonymous Agent',
      classGroup: agentInfo?.classGroup || 'SEC-1A',
      nickname: agentInfo?.nickname || 'CyberNinja',
      avatarId: agentInfo?.avatarId || 'cyber-ninja',
      startTime,
      endTime: end,
      timeSpentSeconds,
      difficulty,
      score,
      maxScore: maxScoreVal,
      percentage,
      correctCount: answerLogs.filter((l) => l.isCorrect).length,
      incorrectCount: answerLogs.filter((l) => !l.isCorrect).length,
      totalQuestions: activeQuestions.length,
      levelReached: reason === 'cleared' ? 'Zone 3 (Cleared)' : `Zone ${activeQuestions[Math.min(answerLogs.length, activeQuestions.length - 1)]?.zone || 1}`,
      badgesEarned: unlockedBadgeTitles,
      finalStatus: finalStatusStr
    };

    // Submit to Google Sheets API + update local storage
    setSyncStatus({ success: false, message: 'กำลังส่งข้อมูลไปยัง Google Sheets...' });
    const result = await submitGameDataToSheets(payload, gasUrl);
    setSyncStatus(result);

    // Refresh Leaderboard
    setLeaderboardEntries(getLocalLeaderboard());

    setCurrentScreen('summary');
  };

  const handleRetrySync = async () => {
    if (!startTime || !endTime) return;
    const maxScoreVal = calculateMaxScore();
    const percentage = Math.round((score / maxScoreVal) * 100);

    const payload: GameResultPayload = {
      studentId: agentInfo?.studentId || '6802041510000',
      fullName: agentInfo?.fullName || 'Anonymous Agent',
      classGroup: agentInfo?.classGroup || 'SEC-1A',
      nickname: agentInfo?.nickname || 'CyberNinja',
      avatarId: agentInfo?.avatarId || 'cyber-ninja',
      startTime,
      endTime,
      timeSpentSeconds: 300,
      difficulty,
      score,
      maxScore: maxScoreVal,
      percentage,
      correctCount: answerLogs.filter((l) => l.isCorrect).length,
      incorrectCount: answerLogs.filter((l) => !l.isCorrect).length,
      totalQuestions: activeQuestions.length,
      levelReached: endReason === 'cleared' ? 'Zone 3 (Cleared)' : 'Zone 2',
      badgesEarned: badges.filter((b) => b.unlocked).map((b) => b.title),
      finalStatus: percentage >= 70 ? 'SURVIVOR' : 'INFECTED OPERATIVE'
    };

    setSyncStatus({ success: false, message: 'กำลังลองส่งอีกครั้ง...' });
    const res = await submitGameDataToSheets(payload, gasUrl);
    setSyncStatus(res);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Kanit',sans-serif] selection:bg-red-500 selection:text-white">
      
      {/* Dynamic Cyber Ambient Background */}
      <CyberBackground isCriticalHp={hp <= 1} />

      {/* Persistent Navigation Header */}
      <HeaderNav
        currentScreen={currentScreen}
        agentInfo={agentInfo}
        hp={hp}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onNavigate={(screen) => setCurrentScreen(screen)}
        onOpenAppsScript={() => setIsAppsScriptModalOpen(true)}
      />

      {/* Screen Router */}
      <main className="flex-1 flex flex-col">
        {currentScreen === 'start' && (
          <StartScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            hasExistingAgent={!!agentInfo}
            registeredNickname={agentInfo?.nickname}
          />
        )}

        {currentScreen === 'register' && (
          <RegisterScreen
            initialAgent={agentInfo}
            onSaveAgent={handleSaveAgent}
            onNavigateToHowToPlay={() => setCurrentScreen('how-to-play')}
          />
        )}

        {currentScreen === 'how-to-play' && (
          <HowToPlayScreen
            difficulty={difficulty}
            onSelectDifficulty={(d) => setDifficulty(d)}
            onStartGame={handleStartGameSession}
          />
        )}

        {currentScreen === 'game' && (
          <MazeGameView
            difficulty={difficulty}
            hp={hp}
            score={score}
            hintsLeft={hintsLeft}
            onUpdateHp={(newHp) => setHp(newHp)}
            onUpdateScore={(delta) => setScore((prev) => prev + delta)}
            onUseHint={handleUseHint}
            onAnswerLog={(log) => setAnswerLogs((prev) => [...prev, log])}
            onEndGame={handleEndGameSession}
            onAbortGame={() => setCurrentScreen('start')}
          />
        )}

        {currentScreen === 'summary' && agentInfo && (
          <SummaryScreen
            agentInfo={agentInfo}
            score={score}
            maxScore={calculateMaxScore()}
            correctCount={answerLogs.filter((l) => l.isCorrect).length}
            incorrectCount={answerLogs.filter((l) => !l.isCorrect).length}
            totalQuestions={activeQuestions.length || 10}
            timeSpentSeconds={Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000) || 120}
            difficulty={difficulty}
            endReason={endReason}
            badges={badges}
            answerLogs={answerLogs}
            syncStatus={syncStatus}
            gasUrl={gasUrl}
            onRetrySync={handleRetrySync}
            onNavigateToLeaderboard={() => setCurrentScreen('leaderboard')}
            onOpenAppsScript={() => setIsAppsScriptModalOpen(true)}
            onPlayAgain={handleStartGameSession}
          />
        )}

        {currentScreen === 'leaderboard' && (
          <LeaderboardScreen
            entries={leaderboardEntries}
            onBackToStart={() => setCurrentScreen('start')}
            onOpenAppsScript={() => setIsAppsScriptModalOpen(true)}
            onRefreshLeaderboard={reloadLeaderboard}
          />
        )}
      </main>

      {/* Google Apps Script Modal */}
      <AppsScriptModal
        isOpen={isAppsScriptModalOpen}
        onClose={() => setIsAppsScriptModalOpen(false)}
        gasUrl={gasUrl}
        onUpdateGasUrl={handleUpdateGasUrl}
      />

    </div>
  );
}
