import { GameResultPayload, LeaderboardEntry } from '../types';

export const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbyRr2vHRiKvZtwGKsEr-J7D2f4rwknfD8Li7Mz1gHPnnuOjs64ZtXQ8ESzzlev85guG2A/exec';

const LOCAL_STORAGE_KEY = 'CYBER_NIGHTMARE_LEADERBOARD_V1';

export async function submitGameDataToSheets(
  payload: GameResultPayload,
  customGasUrl: string = DEFAULT_GAS_URL,
  spreadsheetId: string = '1UbRAZHJXDXJrYpYk99mKZxny6D6zD48Eldo8Zevl0EA'
): Promise<{ success: boolean; message: string; isCachedLocally?: boolean }> {
  // Always store locally first as guarantee
  saveToLocalStorage(payload);

  // 1. First try native backend Express route (uses user's OAuth access token automatically)
  try {
    const apiRes = await fetch('/api/sheets/append', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        spreadsheetId,
        payload
      })
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success) {
        return {
          success: true,
          message: 'บันทึกข้อมูลลง Google Sheet สำเร็จเรียบร้อยแล้ว!'
        };
      }
    }
  } catch (err) {
    console.warn('Backend API append failed, trying GAS Web App fallback...', err);
  }

  // 2. Fallback to custom GAS Web App URL if available
  if (customGasUrl && customGasUrl.trim() !== '') {
    try {
      await fetch(customGasUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      return {
        success: true,
        message: 'ส่งข้อมูลไปยัง Google Sheets (GAS) เรียบร้อยแล้ว!'
      };
    } catch (error) {
      console.error('Failed to submit to Google Apps Script:', error);
    }
  }

  return {
    success: true,
    message: 'บันทึกในระบบออฟไลน์เรียบร้อยแล้ว (โปรดตรวจสอบการอนุญาต Google Sheets OAuth)',
    isCachedLocally: true
  };
}

export async function fetchSheetsLeaderboard(spreadsheetId: string = '1UbRAZHJXDXJrYpYk99mKZxny6D6zD48Eldo8Zevl0EA'): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`/api/sheets/read?spreadsheetId=${encodeURIComponent(spreadsheetId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.entries) && data.entries.length > 0) {
        return data.entries.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score);
      }
    }
  } catch (err) {
    console.warn('Failed to fetch entries from Google Sheets API, fallback to local', err);
  }
  return getLocalLeaderboard();
}

export function saveToLocalStorage(payload: GameResultPayload): void {
  try {
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existingList: LeaderboardEntry[] = existingRaw ? JSON.parse(existingRaw) : [];

    const newEntry: LeaderboardEntry = {
      ...payload,
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      syncTimestamp: new Date().toISOString()
    };

    // Keep highest score or prepend new
    existingList.unshift(newEntry);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingList));
  } catch (err) {
    console.error('Failed to save to local storage', err);
  }
}

export function getLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!existingRaw) {
      // Return default starter mock agents if empty so dashboard looks populated & exciting!
      return getStarterMockLeaderboard();
    }
    const list: LeaderboardEntry[] = JSON.parse(existingRaw);
    return list.sort((a, b) => b.score - a.score);
  } catch (err) {
    console.error('Error reading local leaderboard', err);
    return getStarterMockLeaderboard();
  }
}

export function getStarterMockLeaderboard(): LeaderboardEntry[] {
  return [
    {
      id: 'mock-1',
      studentId: '6802041510001',
      fullName: 'พงศกร สุขสวัสดิ์',
      classGroup: 'SEC-1A',
      nickname: 'Agent CyberNinja',
      avatarId: 'cyber-ninja',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date(Date.now() - 3300000).toISOString(),
      timeSpentSeconds: 300,
      difficulty: 'hardcore',
      score: 1650,
      maxScore: 1650,
      percentage: 100,
      correctCount: 10,
      incorrectCount: 0,
      totalQuestions: 10,
      levelReached: 'Zone 3 (Cleared)',
      badgesEarned: ['Novice Shield', 'Threat Hunter', 'Cyber Legend'],
      finalStatus: 'ELITE CYBER DEFENDER'
    },
    {
      id: 'mock-2',
      studentId: '6802041510012',
      fullName: 'กัญญาณัฐ นครินทร์',
      classGroup: 'SEC-1A',
      nickname: 'Cryptographer X',
      avatarId: 'cryptographer',
      startTime: new Date(Date.now() - 7200000).toISOString(),
      endTime: new Date(Date.now() - 6840000).toISOString(),
      timeSpentSeconds: 360,
      difficulty: 'normal',
      score: 1450,
      maxScore: 1650,
      percentage: 87.8,
      correctCount: 9,
      incorrectCount: 1,
      totalQuestions: 10,
      levelReached: 'Zone 3 (Cleared)',
      badgesEarned: ['Novice Shield', 'Threat Hunter'],
      finalStatus: 'SURVIVOR'
    },
    {
      id: 'mock-3',
      studentId: '6802041510025',
      fullName: 'ธนกฤต วิเศษศิลป์',
      classGroup: 'SEC-2B',
      nickname: 'Net Sentinel',
      avatarId: 'net-sentinel',
      startTime: new Date(Date.now() - 10800000).toISOString(),
      endTime: new Date(Date.now() - 10400000).toISOString(),
      timeSpentSeconds: 400,
      difficulty: 'normal',
      score: 1200,
      maxScore: 1650,
      percentage: 72.7,
      correctCount: 8,
      incorrectCount: 2,
      totalQuestions: 10,
      levelReached: 'Zone 3 (Cleared)',
      badgesEarned: ['Novice Shield', 'Threat Hunter'],
      finalStatus: 'SURVIVOR'
    }
  ];
}
