import React, { useState, useEffect, useRef } from 'react';
import { Shield, Heart, Clock, AlertTriangle, CheckCircle2, XCircle, HelpCircle, Terminal, Lock, ArrowRight, RotateCcw, Zap, Sparkles } from 'lucide-react';
import { Question, GameDifficulty, AnswerLog } from '../types';
import { playCorrectSound, playWrongSound, playHeartbeat, playAlarmGlitch } from '../utils/sound';

interface GameplayScreenProps {
  questions: Question[];
  difficulty: GameDifficulty;
  hp: number;
  score: number;
  hintsLeft: number;
  onAnswerQuestion: (isCorrect: boolean, pointsEarned: number, log: AnswerLog) => void;
  onUseHint: () => void;
  onEndGame: (reason: 'cleared' | 'hp_zero') => void;
  onAbortGame: () => void;
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
  questions,
  difficulty,
  hp,
  score,
  hintsLeft,
  onAnswerQuestion,
  onUseHint,
  onEndGame,
  onAbortGame
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];

  const initialTimePerQuestion = difficulty === 'hardcore' ? 45 : 60;
  const [timeLeft, setTimeLeft] = useState(initialTimePerQuestion);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [pointsEarnedThisTurn, setPointsEarnedThisTurn] = useState(0);

  const [showHintModal, setShowHintModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound heartbeat effect when time < 10s
  useEffect(() => {
    if (!isSubmitted && timeLeft <= 8 && timeLeft > 0) {
      playHeartbeat();
    }
  }, [timeLeft, isSubmitted]);

  // Countdown Timer Logic
  useEffect(() => {
    if (isSubmitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Timeout counts as incorrect answer
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isSubmitted]);

  const handleTimeout = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    setIsCorrect(false);
    setSelectedOption(null);
    setPointsEarnedThisTurn(0);
    playWrongSound();

    const log: AnswerLog = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      selectedOption: -1,
      correctOption: currentQuestion.correctAnswer,
      isCorrect: false,
      timeSpentSeconds: initialTimePerQuestion,
      pointsEarned: 0
    };

    onAnswerQuestion(false, 0, log);
  };

  const handleSelectOption = (index: number) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isSubmitted) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const correct = selectedOption === currentQuestion.correctAnswer;
    setIsSubmitted(true);
    setIsCorrect(correct);

    const timeSpent = initialTimePerQuestion - timeLeft;
    let earned = 0;

    if (correct) {
      const basePoints = currentQuestion.points;
      const timeBonus = Math.floor((timeLeft / initialTimePerQuestion) * 50);
      const difficultyMultiplier = difficulty === 'hardcore' ? 1.2 : 1.0;
      earned = Math.round((basePoints + timeBonus) * difficultyMultiplier);
      playCorrectSound();
    } else {
      playWrongSound();
      playAlarmGlitch();
    }

    setPointsEarnedThisTurn(earned);

    const log: AnswerLog = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      selectedOption: selectedOption,
      correctOption: currentQuestion.correctAnswer,
      isCorrect: correct,
      timeSpentSeconds: timeSpent,
      pointsEarned: earned
    };

    onAnswerQuestion(correct, earned, log);
  };

  const handleNext = () => {
    // Check if HP reached 0
    if (hp <= 0 && isCorrect === false) {
      onEndGame('hp_zero');
      return;
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setIsCorrect(null);
      setTimeLeft(initialTimePerQuestion);
    } else {
      onEndGame('cleared');
    }
  };

  const progressPercentage = Math.round(((currentIndex + (isSubmitted ? 1 : 0)) / questions.length) * 100);

  return (
    <div className="relative z-10 min-h-[calc(100vh-65px)] flex flex-col justify-between p-4 max-w-4xl mx-auto my-auto animate-fade-in space-y-4">
      
      {/* Top HUD Stats Bar */}
      <div className="p-3.5 sm:p-4 bg-[#080808] border border-red-900/40 shadow-xl backdrop-blur-md space-y-3 font-mono">
        
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          
          {/* Zone Indicator */}
          <div className="flex items-center space-x-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-red-500 uppercase tracking-widest font-bold">Zone Status</span>
              <span className="text-white font-bold uppercase tracking-wider">
                ZONE {currentQuestion.zone}: {currentQuestion.zone === 1 ? 'EXTERNAL BREACH' : currentQuestion.zone === 2 ? 'INNER DATA' : 'CORE VAULT'}
              </span>
            </div>
            <div className="h-6 w-px bg-red-900/40" />
            <span className="text-gray-400 text-xs">ข้อ {currentIndex + 1}/{questions.length}</span>
          </div>

          {/* Current Score & HP */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-[10px] text-red-500 uppercase tracking-widest block">Data Points</span>
              <span className="text-lg font-bold text-white flex items-center justify-end gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {score.toString().padStart(6, '0')}
              </span>
            </div>

            {/* HP Hearts */}
            <div className="text-right pl-3 border-l border-red-900/40">
              <span className="text-[10px] text-red-500 uppercase tracking-widest block">Cyber HP</span>
              <div className="flex gap-1.5 mt-0.5">
                {[1, 2, 3].map((hIndex) => (
                  <span
                    key={hIndex}
                    className={`text-lg transition-all ${
                      hIndex <= hp ? 'text-red-600 scale-100 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-gray-800 scale-90'
                    }`}
                  >
                    ❤
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Progress Bar & Timer Row */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] font-mono text-gray-400 uppercase tracking-wider">
            <span>System Recovery Progress: {progressPercentage}%</span>
            <span className={`flex items-center gap-1 font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              <Clock className="w-3.5 h-3.5 text-red-500" /> Timer: {timeLeft}s
            </span>
          </div>

          {/* Recovery Progress Bar */}
          <div className="w-full h-1.5 bg-[#121212] overflow-hidden border border-red-900/30">
            <div
              className="h-full bg-gradient-to-r from-red-800 via-red-600 to-amber-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

      </div>

      {/* Main Question Card */}
      <div className="p-5 sm:p-7 bg-[#0a0a0a] border border-red-900/50 shadow-2xl space-y-5 font-mono">
        
        {/* Scenario Tag & Category & Points */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-900/30 pb-3">
          <span className="bg-red-600 text-black text-[10px] font-black px-2 py-0.5 uppercase tracking-wider inline-block">
            Scenario: {currentQuestion.category}
          </span>
          <div className="text-xs text-gray-400">
            CRITICALITY: <strong className="text-amber-400 font-bold">{currentQuestion.points} PT</strong>
          </div>
        </div>

        {/* Question Text */}
        <h2 className="text-base sm:text-xl text-white font-bold leading-relaxed uppercase italic font-['JetBrains_Mono',monospace]">
          {currentQuestion.question}
        </h2>

        {/* Scenario Context Box if present */}
        {currentQuestion.scenarioContext && (
          <div className="p-4 bg-[#080808] border border-red-900/30 space-y-2 text-xs">
            {currentQuestion.scenarioContext.header && (
              <div className="text-[11px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-2 border-b border-red-900/20 pb-1">
                <Terminal className="w-3.5 h-3.5" />
                {currentQuestion.scenarioContext.header}
              </div>
            )}
            <p className="text-gray-300 leading-relaxed whitespace-pre-line text-xs font-['Kanit',sans-serif]">
              {currentQuestion.scenarioContext.content}
            </p>
          </div>
        )}

        {/* Options List styled to Sophisticated Dark layout */}
        <div className="grid grid-cols-1 gap-3 pt-1">
          {currentQuestion.options.map((optionText, index) => {
            const isSelected = selectedOption === index;
            const letter = String.fromCharCode(65 + index);
            let containerStyle = 'border-red-900/30 bg-[#0f0f0f] hover:bg-red-950/20 hover:border-red-600 text-gray-300';
            let letterStyle = 'text-red-500 font-bold';
            let checkboxStyle = 'border-red-900 group-hover:border-red-600';

            if (isSubmitted) {
              if (index === currentQuestion.correctAnswer) {
                containerStyle = 'border-emerald-500 bg-emerald-950/30 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]';
                letterStyle = 'text-emerald-400 font-bold';
                checkboxStyle = 'bg-emerald-500 border-emerald-400';
              } else if (isSelected) {
                containerStyle = 'border-red-600 bg-red-950/30 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]';
                letterStyle = 'text-red-400 font-bold';
                checkboxStyle = 'bg-red-600 border-red-500';
              } else {
                containerStyle = 'border-gray-900 bg-[#080808] text-gray-600 opacity-50';
                letterStyle = 'text-gray-700';
                checkboxStyle = 'border-gray-900';
              }
            } else if (isSelected) {
              containerStyle = 'border-red-600 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.15)] text-white';
              letterStyle = 'text-white font-bold';
              checkboxStyle = 'bg-red-600 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';
            }

            return (
              <button
                key={index}
                disabled={isSubmitted}
                onClick={() => handleSelectOption(index)}
                className={`group flex items-center justify-between p-4 border transition-colors text-left ${containerStyle}`}
              >
                <div className="flex items-center gap-4 flex-1 pr-4">
                  <span className={`text-xs font-mono uppercase ${letterStyle}`}>[{letter}]</span>
                  <span className="text-xs sm:text-sm uppercase tracking-wide font-['Kanit',sans-serif] leading-relaxed">
                    {optionText}
                  </span>
                </div>
                <div className={`w-4 h-4 border transition-all shrink-0 ${checkboxStyle}`} />
              </button>
            );
          })}
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-red-900/30">
          
          {/* Hint Button */}
          {!isSubmitted ? (
            <button
              onClick={() => {
                if (hintsLeft > 0) {
                  onUseHint();
                  setShowHintModal(true);
                }
              }}
              disabled={hintsLeft <= 0}
              className={`px-4 py-2.5 border text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors ${
                hintsLeft > 0
                  ? 'bg-[#0f0f0f] border-yellow-600/60 text-yellow-500 hover:bg-yellow-950/20 hover:border-yellow-500'
                  : 'bg-[#080808] border-gray-900 text-gray-700 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>System Hint (Left: {hintsLeft})</span>
            </button>
          ) : (
            <div />
          )}

          {/* Submit / Next Button */}
          {!isSubmitted ? (
            <button
              disabled={selectedOption === null}
              onClick={handleSubmitAnswer}
              className={`px-6 py-3 border text-xs font-bold uppercase font-mono tracking-widest transition-all ${
                selectedOption !== null
                  ? 'bg-red-600 border-red-500 text-white hover:bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-[#0f0f0f] border-gray-900 text-gray-600 cursor-not-allowed'
              }`}
            >
              [Execute Decision]
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white border border-red-400 font-extrabold text-xs sm:text-sm uppercase font-mono tracking-widest transition-all flex items-center space-x-2 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
              <span>[Proceed to Next Terminal]</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

        </div>

        {/* Immediate Feedback Banner */}
        {isSubmitted && (
          <div className={`p-4 border text-xs sm:text-sm space-y-2 animate-fade-in ${
            isCorrect
              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
              : 'bg-red-950/40 border-red-600 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
          }`}>
            <div className="flex items-center justify-between font-mono font-bold text-sm border-b border-current/20 pb-2">
              <span className="flex items-center gap-2">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 tracking-wider">THREAT NEUTRALIZED</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-500 animate-pulse" />
                    <span className="text-red-500 tracking-wider">SYSTEM BREACHED</span>
                  </>
                )}
              </span>
              <span>
                {isCorrect ? `+${pointsEarnedThisTurn} DATA POINTS` : '-1 CYBER HP'}
              </span>
            </div>

            <div className="space-y-1 font-['Kanit',sans-serif] text-xs leading-relaxed pt-1">
              <p>
                <strong className="font-mono text-gray-300">ANALYSIS LOG:</strong> {currentQuestion.explanation}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Hint Modal */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0a0a0a] border border-yellow-600 max-w-md w-full p-6 shadow-[0_0_30px_rgba(202,138,4,0.2)] space-y-4 text-xs font-mono">
            <div className="flex items-center space-x-2 text-yellow-500 font-bold border-b border-yellow-900/40 pb-3">
              <Zap className="w-4 h-4" />
              <span className="tracking-widest uppercase">FIREWALL SYSTEM HINT</span>
            </div>
            <p className="text-gray-300 leading-relaxed font-['Kanit',sans-serif]">
              {currentQuestion.hint}
            </p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHintModal(false)}
                className="px-5 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase transition-colors"
              >
                ACKNOWLEDGE
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
