import { MazeGrid, InventoryItem, ZoneNumber } from '../types';
import { QUESTION_BANK } from './questions';

export const JUNK_ITEMS: InventoryItem[] = [
  {
    id: 'junk-ram',
    name: 'Corrupted RAM Stick',
    type: 'junk',
    description: 'แผงแรมชำรุด ข้อมูลเสียหายหนัก ไม่สามารถนำมาใช้งานเอาชีวิตรอดได้',
    iconName: 'Cpu',
    isJunk: true
  },
  {
    id: 'junk-cable',
    name: 'Burnt Ethernet Cable',
    type: 'junk',
    description: 'สายแลนที่ถูกความร้อนละลายจนขดลวดขาดยับเยิน',
    iconName: 'Cable',
    isJunk: true
  },
  {
    id: 'junk-mug',
    name: 'Old Coffee Mug',
    type: 'junk',
    description: 'แก้วกาแฟเก่าว่างเปล่าของแฮกเกอร์ในอดีต',
    iconName: 'Coffee',
    isJunk: true
  },
  {
    id: 'junk-disk',
    name: 'Scratched Floppy Disk',
    type: 'junk',
    description: 'แผ่นฟลอปปีดิสก์โบราณที่มีแต่สัญญาณรบกวน (Noise)',
    iconName: 'Disc',
    isJunk: true
  },
  {
    id: 'junk-lock',
    name: 'Rusted Keyhole',
    type: 'junk',
    description: 'เศษโลหะสนิมจับที่หักในช่องกุญแจ',
    iconName: 'Trash2',
    isJunk: true
  }
];

export const SURVIVAL_ITEMS = {
  keycard1: {
    id: 'keycard-zone1',
    name: 'Access Keycard Level 1',
    type: 'keycard' as const,
    description: 'บัตรผ่านประตูความปลอดภัยสูง สำหรับปลดล็อกประตูทางออก Zone 1',
    iconName: 'Key',
    isJunk: false,
    usable: false
  },
  tokenZone2_1: {
    id: 'token-zone2-1',
    name: 'Encryption Fragment A',
    type: 'token' as const,
    description: 'ชิ้นส่วนรหัสผ่านเข้ารหัสส่วนแรก (ต้องการ 2 ชิ้นเพื่อเปิดประตู Zone 2)',
    iconName: 'Shield',
    isJunk: false,
    usable: false
  },
  tokenZone2_2: {
    id: 'token-zone2-2',
    name: 'Encryption Fragment B',
    type: 'token' as const,
    description: 'ชิ้นส่วนรหัสผ่านเข้ารหัสส่วนที่สอง (ต้องการ 2 ชิ้นเพื่อเปิดประตู Zone 2)',
    iconName: 'ShieldCheck',
    isJunk: false,
    usable: false
  },
  masterKey: {
    id: 'master-override',
    name: 'Master Core Passcode',
    type: 'keycard' as const,
    description: 'รหัสอนุมัติสูงสุด Master Override สำหรับเปิดประตูหนีออกจาก Data Center',
    iconName: 'Unlock',
    isJunk: false,
    usable: false
  },
  medkit: {
    id: 'medkit-nano',
    name: 'Nano Medkit',
    type: 'medkit' as const,
    description: 'กล่องปฐมพยาบาลฉุกเฉินระดับนาโน (กดใช้เพื่อฟื้นฟู +1 Cyber HP)',
    iconName: 'HeartHandshake',
    isJunk: false,
    usable: true
  },
  scanner: {
    id: 'sonar-scanner',
    name: 'Radar Scanner Drone',
    type: 'scanner' as const,
    description: 'โดรนสแกนพิกัด (กดใช้เพื่อเปิดสแกนแผนที่เขาวงกตทั้งหมด)',
    iconName: 'Radar',
    isJunk: false,
    usable: true
  },
  shield: {
    id: 'em-shield',
    name: 'EM Deflection Shield',
    type: 'shield' as const,
    description: 'โล่ป้องกันความเสียหาย (ทำงานอัตโนมัติ ป้องกันการโดนหัก HP เมื่อตอบผิด 1 ครั้ง)',
    iconName: 'ShieldAlert',
    isJunk: false,
    usable: false
  }
};

// 0: path, 1: wall
export const ZONE_1_GRID: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const ZONE_2_GRID: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

export const ZONE_3_GRID: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

export function getMazeForZone(zone: ZoneNumber): MazeGrid {
  const z1Questions = QUESTION_BANK.filter(q => q.zone === 1);
  const z2Questions = QUESTION_BANK.filter(q => q.zone === 2);
  const z3Questions = QUESTION_BANK.filter(q => q.zone === 3);

  if (zone === 1) {
    return {
      width: 11,
      height: 11,
      grid: ZONE_1_GRID,
      startPos: { x: 1, y: 1 },
      exitPos: { x: 9, y: 9 },
      requiredKeys: 1,
      chests: [
        { id: 'z1-c1', x: 9, y: 1, isOpened: false, questionId: z1Questions[0].id, item: SURVIVAL_ITEMS.keycard1 },
        { id: 'z1-c2', x: 1, y: 9, isOpened: false, questionId: z1Questions[1].id, item: SURVIVAL_ITEMS.medkit },
        { id: 'z1-c3', x: 7, y: 5, isOpened: false, questionId: z1Questions[2].id, item: JUNK_ITEMS[0] },
        { id: 'z1-c4', x: 3, y: 7, isOpened: false, questionId: z1Questions[3].id, item: SURVIVAL_ITEMS.scanner },
      ]
    };
  }

  if (zone === 2) {
    return {
      width: 13,
      height: 13,
      grid: ZONE_2_GRID,
      startPos: { x: 1, y: 1 },
      exitPos: { x: 11, y: 11 },
      requiredKeys: 2,
      chests: [
        { id: 'z2-c1', x: 11, y: 1, isOpened: false, questionId: z2Questions[0].id, item: SURVIVAL_ITEMS.tokenZone2_1 },
        { id: 'z2-c2', x: 1, y: 11, isOpened: false, questionId: z2Questions[1].id, item: SURVIVAL_ITEMS.tokenZone2_2 },
        { id: 'z2-c3', x: 5, y: 5, isOpened: false, questionId: z2Questions[2].id, item: JUNK_ITEMS[1] },
        { id: 'z2-c4', x: 9, y: 3, isOpened: false, questionId: z2Questions[3].id, item: SURVIVAL_ITEMS.shield },
        { id: 'z2-c5', x: 7, y: 9, isOpened: false, questionId: z2Questions[4].id, item: JUNK_ITEMS[2] },
      ]
    };
  }

  // Zone 3
  return {
    width: 15,
    height: 15,
    grid: ZONE_3_GRID,
    startPos: { x: 1, y: 1 },
    exitPos: { x: 13, y: 13 },
    requiredKeys: 1,
    chests: [
      { id: 'z3-c1', x: 13, y: 1, isOpened: false, questionId: z3Questions[0].id, item: SURVIVAL_ITEMS.masterKey },
      { id: 'z3-c2', x: 1, y: 13, isOpened: false, questionId: z3Questions[1].id, item: SURVIVAL_ITEMS.medkit },
      { id: 'z3-c3', x: 5, y: 7, isOpened: false, questionId: z3Questions[2].id, item: JUNK_ITEMS[3] },
      { id: 'z3-c4', x: 9, y: 5, isOpened: false, questionId: z3Questions[3].id, item: JUNK_ITEMS[4] },
      { id: 'z3-c5', x: 11, y: 9, isOpened: false, questionId: z3Questions[4].id, item: SURVIVAL_ITEMS.scanner },
    ]
  };
}
