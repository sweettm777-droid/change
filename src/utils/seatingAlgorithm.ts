import { DeskCell, SeatingLayoutConfig, Student, TeacherConstraints } from '../types';

export function generateDeskGrid(config: SeatingLayoutConfig, totalStudents: number): DeskCell[] {
  const cells: DeskCell[] = [];
  const { rows, cols, mode, singleCols } = config;

  let assignedCount = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let isActive = true;
      let groupIndex = 0;

      if (mode === 'pair') {
        // Pairs of 2
        groupIndex = Math.floor(c / 2);
      } else if (mode === 'exam') {
        // Exam mode: each desk is solitary
        groupIndex = c;
      } else if (mode === 'hybrid') {
        // Some columns are singles, some pairs
        // If col is in singleCols, it's alone. Otherwise paired with neighbor
        if (singleCols.includes(c)) {
          groupIndex = 100 + c; // unique single
        } else {
          // calculate group index based on previous pairs
          let pairColCount = 0;
          for (let i = 0; i <= c; i++) {
            if (!singleCols.includes(i)) {
              pairColCount++;
            }
          }
          groupIndex = Math.floor((pairColCount - 1) / 2);
        }
      }

      // If total active desks exceed students by too much or if user customized,
      // default: first totalStudents desks are active, or all are active up to capacity
      if (assignedCount >= totalStudents && mode !== 'custom') {
        // keep cell in grid but can be active or inactive
        // Usually teachers want all designated seats active up to capacity
      }
      assignedCount++;

      cells.push({
        id: `r${r}-c${c}`,
        row: r,
        col: c,
        isActive,
        groupIndex,
        studentId: null,
        isRevealed: false,
        isFixed: false,
      });
    }
  }

  return cells;
}

// Check if two desks are adjacent (sharing an edge or adjacent in same row)
export function areDesksAdjacent(desk1: DeskCell, desk2: DeskCell): boolean {
  if (!desk1.isActive || !desk2.isActive) return false;
  const rowDiff = Math.abs(desk1.row - desk2.row);
  const colDiff = Math.abs(desk1.col - desk2.col);

  // Directly left/right
  if (rowDiff === 0 && colDiff === 1) return true;
  // Directly front/back
  if (colDiff === 0 && rowDiff === 1) return true;
  // Diagonal touching
  if (rowDiff === 1 && colDiff === 1) return true;

  return false;
}

// Fisher-Yates shuffle
export function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface SeatingResult {
  cells: DeskCell[];
  conflicts: string[];
  success: boolean;
}

export function solveSeatingArrangement(
  initialCells: DeskCell[],
  students: Student[],
  constraints: TeacherConstraints
): SeatingResult {
  const activeCells = initialCells.filter((c) => c.isActive);

  if (students.length === 0 || activeCells.length === 0) {
    return {
      cells: initialCells.map((c) => ({ ...c, studentId: null, isFixed: false })),
      conflicts: [],
      success: true,
    };
  }

  const studentMap = new Map<string, Student>(students.map((s) => [s.id, s]));
  const studentNameToId = new Map<string, string>(students.map((s) => [s.name.trim(), s.id]));

  // 1. Identify fixed seats
  const fixedAssignments: { studentId: string; cellId: string }[] = [];
  const fixedStudentIds = new Set<string>();
  const fixedCellIds = new Set<string>();

  for (const fa of constraints.fixedAssignments) {
    let sId = fa.studentId;
    if (!studentMap.has(sId) && studentNameToId.has(sId)) {
      sId = studentNameToId.get(sId)!;
    }
    const targetCell = activeCells.find((c) => c.row === fa.row && c.col === fa.col);
    if (targetCell && studentMap.has(sId) && !fixedStudentIds.has(sId)) {
      fixedAssignments.push({ studentId: sId, cellId: targetCell.id });
      fixedStudentIds.add(sId);
      fixedCellIds.add(targetCell.id);
    }
  }

  // Identify separation pairs
  const separationPairsNormalized: [string, string][] = [];
  for (const [p1, p2] of constraints.separationPairs) {
    let id1 = p1;
    let id2 = p2;
    if (!studentMap.has(id1) && studentNameToId.has(id1)) id1 = studentNameToId.get(id1)!;
    if (!studentMap.has(id2) && studentNameToId.has(id2)) id2 = studentNameToId.get(id2)!;

    if (studentMap.has(id1) && studentMap.has(id2) && id1 !== id2) {
      separationPairsNormalized.push([id1, id2]);
    }
  }

  // Students to place randomly
  const freeStudents = students.filter((s) => !fixedStudentIds.has(s.id));
  const freeCells = activeCells.filter((c) => !fixedCellIds.has(c.id));

  const maxAttempts = 300;
  let bestAttemptCells: DeskCell[] | null = null;
  let leastConflicts = 999;
  let lastConflictReasons: string[] = [];

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shuffledStudents = shuffleArray(freeStudents);
    const cellMap = new Map<string, DeskCell>();

    // Copy all cells
    initialCells.forEach((c) => {
      cellMap.set(c.id, {
        ...c,
        studentId: null,
        isFixed: false,
        isRevealed: false,
      });
    });

    // Place fixed students
    for (const fa of fixedAssignments) {
      const cell = cellMap.get(fa.cellId);
      if (cell) {
        cell.studentId = fa.studentId;
        cell.isFixed = true;
      }
    }

    // Place free students into free cells
    const shuffledFreeCells = shuffleArray(freeCells);
    for (let i = 0; i < shuffledStudents.length; i++) {
      if (i < shuffledFreeCells.length) {
        const cell = cellMap.get(shuffledFreeCells[i].id);
        if (cell) {
          cell.studentId = shuffledStudents[i].id;
        }
      }
    }

    // Verify separation constraints
    const conflictReasons: string[] = [];
    for (const [id1, id2] of separationPairsNormalized) {
      const s1 = studentMap.get(id1);
      const s2 = studentMap.get(id2);
      if (!s1 || !s2) continue;

      let cell1: DeskCell | undefined;
      let cell2: DeskCell | undefined;

      for (const cell of cellMap.values()) {
        if (cell.studentId === id1) cell1 = cell;
        if (cell.studentId === id2) cell2 = cell;
      }

      if (cell1 && cell2 && areDesksAdjacent(cell1, cell2)) {
        conflictReasons.push(`[${s1.name}] 학생과 [${s2.name}] 학생이 인접하여 배치되었습니다.`);
      }
    }

    if (conflictReasons.length === 0) {
      // Perfect placement!
      return {
        cells: Array.from(cellMap.values()),
        conflicts: [],
        success: true,
      };
    }

    if (conflictReasons.length < leastConflicts) {
      leastConflicts = conflictReasons.length;
      bestAttemptCells = Array.from(cellMap.values());
      lastConflictReasons = conflictReasons;
    }
  }

  // If constraints could not be 100% satisfied due to strict layout, return best attempt
  return {
    cells: bestAttemptCells || initialCells,
    conflicts: lastConflictReasons,
    success: false,
  };
}
