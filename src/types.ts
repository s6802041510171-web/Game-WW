export type ScreenType = 'start' | 'register' | 'how-to-play' | 'game' | 'summary' | 'leaderboard' | 'apps-script';

export type GameDifficulty = 'normal' | 'hardcore';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type ZoneNumber = 1 | 2 | 3;

export interface AgentInfo {
  studentId: string;
  fullName: string;
  classGroup: string;
  nickname: string;
  avatarId: string;
}

export interface Question {
  id: number;
  zone: ZoneNumber;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
  difficulty: QuestionDifficulty;
  points: number;
  category: string;
  scenarioContext?: {
    type: 'terminal' | 'email' | 'alert' | 'code';
    header?: string;
    content: string;
  };
  hint: string;
}

export type BadgeTier = 'Novice Shield' | 'Threat Hunter' | 'Cyber Legend';

export type ItemType = 'keycard' | 'token' | 'medkit' | 'scanner' | 'shield' | 'time' | 'junk';

export interface InventoryItem {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  iconName: string;
  isJunk: boolean;
  usable?: boolean;
}

export interface Chest {
  id: string;
  x: number;
  y: number;
  isOpened: boolean;
  questionId: number;
  item: InventoryItem;
}

export interface MazeGrid {
  width: number;
  height: number;
  grid: number[][]; // 0: path, 1: wall
  startPos: { x: number; y: number };
  exitPos: { x: number; y: number };
  chests: Chest[];
  requiredKeys: number;
}

export interface Badge {
  id: string;
  title: string;
  tier: BadgeTier;
  description: string;
  iconName: string;
  unlocked: boolean;
}

export interface AnswerLog {
  questionId: number;
  questionText: string;
  selectedOption: number;
  correctOption: number;
  isCorrect: boolean;
  timeSpentSeconds: number;
  pointsEarned: number;
}

export interface GameResultPayload {
  studentId: string;
  fullName: string;
  classGroup: string;
  nickname: string;
  avatarId: string;
  startTime: string;
  endTime: string;
  timeSpentSeconds: number;
  difficulty: GameDifficulty;
  score: number;
  maxScore: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
  levelReached: string;
  badgesEarned: string[];
  finalStatus: string;
  syncTimestamp?: string;
}

export interface LeaderboardEntry extends GameResultPayload {
  id: string;
}
