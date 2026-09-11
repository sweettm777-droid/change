import { CleaningArea, Student } from '../types';
import { shuffleArray } from './seatingAlgorithm';

export function solveCleaningDuty(
  areas: CleaningArea[],
  students: Student[],
  excludedStudentNames: string[] = []
): CleaningArea[] {
  // Deep clone areas
  const updatedAreas: CleaningArea[] = JSON.parse(JSON.stringify(areas));

  // Find all fixed students across all areas
  const fixedNamesSet = new Set<string>();
  updatedAreas.forEach((area) => {
    area.subItems.forEach((sub) => {
      sub.fixedStudents.forEach((name) => {
        if (name && name.trim()) {
          fixedNamesSet.add(name.trim());
        }
      });
    });
  });

  // Students available for random distribution
  // Exclude fixed students and explicitly excluded students
  const availableStudents = students.filter(
    (s) => !fixedNamesSet.has(s.name.trim()) && !excludedStudentNames.includes(s.name.trim())
  );

  const shuffledPool = shuffleArray(availableStudents.map((s) => s.name));
  let poolIndex = 0;

  // Assign students to each subItem
  updatedAreas.forEach((area) => {
    area.subItems.forEach((sub) => {
      const assigned: string[] = [];

      // 1. Add fixed students first
      sub.fixedStudents.forEach((name) => {
        if (name && name.trim()) {
          assigned.push(name.trim());
        }
      });

      // 2. How many additional random students are needed?
      // count represents total students required for this slot
      const remainingNeeded = Math.max(0, sub.count - sub.fixedStudents.length);

      for (let i = 0; i < remainingNeeded; i++) {
        if (poolIndex < shuffledPool.length) {
          assigned.push(shuffledPool[poolIndex]);
          poolIndex++;
        }
      }

      sub.assignedStudents = assigned;
    });
  });

  return updatedAreas;
}
