import React, { useState } from 'react';
import { Trophy, Search, Filter, Award, Shield, User, ArrowLeft, RefreshCw, BarChart2, CheckCircle2, Star } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardScreenProps {
  entries: LeaderboardEntry[];
  onBackToStart: () => void;
  onOpenAppsScript: () => void;
  onRefreshLeaderboard?: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  entries,
  onBackToStart,
  onOpenAppsScript,
  onRefreshLeaderboard
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter entries
  const filteredEntries = entries.filter((item) => {
    const matchesSearch =
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.studentId.includes(searchTerm) ||
      item.nickname.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass === 'ALL' || item.classGroup === selectedClass;

    return matchesSearch && matchesClass;
  });

  // Unique class options
  const classOptions = Array.from(new Set(entries.map((e) => e.classGroup)));

  // Dashboard Summary Metrics
  const totalPlayers = entries.length;
  const avgScore = totalPlayers > 0 ? Math.round(entries.reduce((sum, e) => sum + e.score, 0) / totalPlayers) : 0;
  const topScore = totalPlayers > 0 ? Math.max(...entries.map((e) => e.score)) : 0;
  const passCount = entries.filter((e) => e.percentage >= 70).length;
  const passRate = totalPlayers > 0 ? Math.round((passCount / totalPlayers) * 100) : 0;

  return (
    <div className="relative z-10 min-h-[calc(100vh-65px)] flex flex-col items-center p-4 max-w-5xl mx-auto my-auto animate-fade-in space-y-6 font-mono">
      
      {/* Header Title */}
      <div className="w-full bg-[#0a0a0a] border border-red-900/50 p-6 shadow-2xl space-y-6">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-red-900/30 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#080808] border border-amber-600/60 text-amber-500">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight font-['JetBrains_Mono',monospace]">
                CYBER SURVIVOR LEADERBOARD
              </h2>
              <p className="text-xs text-gray-400 font-['Kanit',sans-serif]">
                ตารางอันดับเจ้าหน้าที่ผู้รอดชีวิต และแดชบอร์ดสรุปผลการเรียนรู้รายกลุ่ม
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={async () => {
                if (onRefreshLeaderboard) {
                  setIsRefreshing(true);
                  await onRefreshLeaderboard();
                  setTimeout(() => setIsRefreshing(false), 600);
                }
              }}
              className="px-3 py-2 bg-[#080808] hover:bg-red-950/40 text-amber-400 border border-amber-900/50 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>SYNC GOOGLE SHEETS</span>
            </button>

            <a
              href="https://docs.google.com/spreadsheets/d/1UbRAZHJXDXJrYpYk99mKZxny6D6zD48Eldo8Zevl0EA/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-[#080808] hover:bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>OPEN SPREADSHEET</span>
            </a>

            <button
              onClick={onBackToStart}
              className="px-3 py-2 bg-[#080808] hover:bg-red-950/20 text-gray-300 border border-red-900/40 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4 text-red-500" />
              <span>[MAIN MENU]</span>
            </button>
          </div>
        </div>

        {/* Dashboard Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
          
          <div className="p-3.5 bg-[#080808] border border-red-900/30 space-y-1">
            <div className="text-[10px] text-red-500 uppercase tracking-widest">Total Agents</div>
            <div className="text-xl sm:text-2xl font-bold text-white">{totalPlayers}</div>
            <div className="text-[10px] text-gray-500">REGISTERED</div>
          </div>

          <div className="p-3.5 bg-[#080808] border border-red-900/30 space-y-1">
            <div className="text-[10px] text-red-500 uppercase tracking-widest">Average Score</div>
            <div className="text-xl sm:text-2xl font-bold text-amber-400">{avgScore}</div>
            <div className="text-[10px] text-gray-500">MEAN DATA PTS</div>
          </div>

          <div className="p-3.5 bg-[#080808] border border-red-900/30 space-y-1">
            <div className="text-[10px] text-red-500 uppercase tracking-widest">Peak Score</div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400">{topScore}</div>
            <div className="text-[10px] text-gray-500">HIGHEST SCORE</div>
          </div>

          <div className="p-3.5 bg-[#080808] border border-red-900/30 space-y-1">
            <div className="text-[10px] text-red-500 uppercase tracking-widest">Pass Rate</div>
            <div className="text-xl sm:text-2xl font-bold text-purple-400">{passRate}%</div>
            <div className="text-[10px] text-gray-500">SUCCESS (&gt;=70%)</div>
          </div>

        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาตามชื่อ, รหัสนักศึกษา, หรือ Agent ID..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-[#080808] border border-red-900/40 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors font-mono"
            />
          </div>

          {/* Class Filter Dropdown */}
          <div className="w-full sm:w-48">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#080808] border border-red-900/40 text-xs font-mono text-white focus:outline-none focus:border-red-600 transition-colors"
            >
              <option value="ALL">ทุกกลุ่มเรียน (All Classes)</option>
              {classOptions.map((cls) => (
                <option key={cls} value={cls}>
                  กลุ่ม {cls}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto border border-red-900/30 bg-[#080808]">
          <table className="w-full text-left text-xs font-['Kanit',sans-serif]">
            <thead className="bg-[#0f0f0f] border-b border-red-900/40 text-red-500 font-mono uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3 text-center">RANK</th>
                <th className="p-3">AGENT / CALLSIGN</th>
                <th className="p-3">STUDENT ID</th>
                <th className="p-3">GROUP</th>
                <th className="p-3 text-center">SCORE</th>
                <th className="p-3 text-center">ACCURACY</th>
                <th className="p-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/20">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 text-xs font-mono">
                    NO OPERATIVE RECORDS FOUND MATCHING QUERY
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry, index) => {
                  let rankBadge = `${index + 1}`;
                  let rankColor = 'text-gray-400';

                  if (index === 0) {
                    rankBadge = '🥇 #1';
                    rankColor = 'text-amber-400 font-bold text-sm';
                  } else if (index === 1) {
                    rankBadge = '🥈 #2';
                    rankColor = 'text-gray-200 font-bold';
                  } else if (index === 2) {
                    rankBadge = '🥉 #3';
                    rankColor = 'text-amber-600 font-bold';
                  }

                  return (
                    <tr key={entry.id || index} className="hover:bg-red-950/20 transition-colors">
                      <td className={`p-3 text-center font-mono ${rankColor}`}>
                        {rankBadge}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-white font-mono">{entry.nickname}</div>
                        <div className="text-[11px] text-gray-400">{entry.fullName}</div>
                      </td>
                      <td className="p-3 font-mono text-gray-300">{entry.studentId}</td>
                      <td className="p-3 font-mono text-gray-400">{entry.classGroup}</td>
                      <td className="p-3 text-center font-mono font-bold text-amber-400">
                        {entry.score}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-white">
                        {entry.percentage}%
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                          entry.percentage >= 90
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : entry.percentage >= 70
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-red-950 text-red-300 border border-red-800'
                        }`}>
                          {entry.finalStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
