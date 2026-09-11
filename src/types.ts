export interface Student {
  id: string;
  name: string;
  number?: number;
  gender?: 'male' | 'female';
}

export type LayoutMode = 'pair' | 'exam' | 'hybrid' | 'custom';

export interface DeskCell {
  id: string; // e.g. "r0-c0"
  row: number;
  col: number;
  isActive: boolean; // whether desk exists
  groupIndex?: number; // pod/group identifier
  studentId: string | null; // assigned student
  isRevealed?: boolean;
  isFixed?: boolean;
}

export interface SeatingLayoutConfig {
  mode: LayoutMode;
  rows: number;
  cols: number;
  // for pair mode: pair grouping (e.g., pairs of 2, gap every 2 cols)
  pairGapEvery: number; 
  // for hybrid mode: which columns are pairs, which are single
  singleCols: number[]; // e.g., [4] means 5th column is single desk
}

export interface TeacherConstraints {
  // Pin protection for secret settings
  pin: string;
  isPinRequired: boolean;
  // Separation: students that must NOT be adjacent (horizontal, vertical, or same pair)
  separationPairs: [string, string][];
  // Fixed seating: student must be in a specific cell
  fixedAssignments: { studentId: string; row: number; col: number }[];
  // Avoid sitting adjacent by gender (optional)
  genderMode?: 'any' | 'alternate';
}

export interface CleaningDutySubItem {
  id: string;
  title: string; // e.g. "교실앞", "교실가운데", "쓸기", "칠판 닦고, 걸레 빨기"
  count: number; // required count
  description?: string;
  fixedStudents: string[]; // students locked (shaded cells in the PDF!)
  assignedStudents: string[];
}

export interface CleaningArea {
  id: string;
  category: string; // 담당: "교실 쓸기", "교실 닦기", "칠판 정리(역할 연동)", "손걸레(월수금)", "복도", "분리수거", "특별구역", "특별구역(화목)"
  note?: string; // 추가 메모/역할 연동/요일
  subItems: CleaningDutySubItem[];
}

export interface CleaningConstraint {
  // Exclude certain students from cleaning or lock specific student to area
  fixedAssignments: { studentId: string; subItemId: string }[];
  excludedStudentIds: string[];
}
