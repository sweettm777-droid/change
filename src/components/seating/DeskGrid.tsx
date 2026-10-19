import React, { useState } from 'react';
import { DeskCell, LayoutMode, Student } from '../../types';
import { ArrowUpDown, Maximize2, Minimize2 } from 'lucide-react';
import { soundEffects } from '../../utils/audio';

interface DeskGridProps {
  desks: DeskCell[];
  students: Student[];
  layoutMode: LayoutMode;
  singleCols: number[];
  perspective: 'student' | 'teacher';
  onTogglePerspective: () => void;
  onSwapStudents: (cellIdA: string, cellIdB: string) => void;
  onToggleDeskActive?: (cellId: string) => void;
  isEditGridMode?: boolean;
}

export const DeskGrid: React.FC<DeskGridProps> = ({
  desks,
  students,
  layoutMode,
  singleCols,
  perspective,
  onTogglePerspective,
  onSwapStudents,
  onToggleDeskActive,
  isEditGridMode = false,
}) => {
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  // Mobile zoom / display mode: 'fit' (screen-fit scaled) vs 'scroll' (100% full cards)
  const [isMobileFitMode, setIsMobileFitMode] = useState<boolean>(false);

  // Student map
  const studentMap = new Map<string, Student>(students.map((s) => [s.id, s]));

  // Grid dimensions
  const maxRow = Math.max(...desks.map((d) => d.row), 0);
  const maxCol = Math.max(...desks.map((d) => d.col), 0);

  // Group desks by row
  const rows: DeskCell[][] = [];
  for (let r = 0; r <= maxRow; r++) {
    const rowDesks = desks
      .filter((d) => d.row === r)
      .sort((a, b) => a.col - b.col);
    rows.push(rowDesks);
  }

  // Handle perspective (if teacher perspective, rows and cols can be flipped or inverted)
  const displayRows = perspective === 'teacher' ? [...rows].reverse() : rows;

  const handleCellClick = (desk: DeskCell) => {
    if (isEditGridMode && onToggleDeskActive) {
      onToggleDeskActive(desk.id);
      return;
    }

    if (!desk.isActive) return;

    if (!selectedCellId) {
      setSelectedCellId(desk.id);
    } else if (selectedCellId === desk.id) {
      setSelectedCellId(null);
    } else {
      // Swap the two cells
      onSwapStudents(selectedCellId, desk.id);
      soundEffects.playCardReveal();
      setSelectedCellId(null);
    }
  };

  // Helper to determine if column should have right margin (aisle)
  const hasAisleAfterCol = (colIndex: number): boolean => {
    if (colIndex === maxCol) return false;

    if (layoutMode === 'exam') {
      return true;
    }

    if (layoutMode === 'pair') {
      return colIndex % 2 === 1;
    }

    if (layoutMode === 'hybrid') {
      if (singleCols.includes(colIndex)) return true;
      if (singleCols.includes(colIndex + 1)) return true;
      return colIndex % 2 === 1;
    }

    return false;
  };

  // Calculate approximate width needed for columns to determine scale ratio on mobile
  const totalColsCount = maxCol + 1;

  return (
    <div className="w-full flex flex-col items-center select-none printable-area">
      {/* Blackboard / Teacher Podium Bar */}
      <div className="w-full max-w-4xl mb-4 sm:mb-6">
        <div className="relative bg-gradient-to-r from-emerald-900 via-teal-950 to-emerald-900 text-white rounded-xl py-2.5 sm:py-3 px-3 sm:px-6 shadow-md border-b-4 border-emerald-800 text-center flex items-center justify-between">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-200">앞문 쪽</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-sm sm:text-lg font-extrabold tracking-widest text-emerald-100 flex items-center space-x-1 sm:space-x-2">
              <span>칠 판 (BLACKBOARD)</span>
            </span>
            <span className="text-[10px] sm:text-[11px] text-emerald-300 font-medium mt-0.5">
              [ 교 탁 ]
            </span>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-200">창문/뒷문</span>
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400"></span>
          </div>
        </div>

        {/* Perspective & Mobile Zoom Toggles (no-print) */}
        <div className="no-print flex flex-wrap items-center justify-between mt-2.5 px-1 gap-2">
          {/* Mobile Fit/Zoom Mode Toggle (visible on screens under 768px) */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileFitMode(!isMobileFitMode)}
              className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-colors shadow-2xs ${
                isMobileFitMode
                  ? 'bg-indigo-600 text-white border-indigo-700'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="모바일 화면에 맞춰 전체 좌석을 한눈에 보거나 원래 크기로 확대합니다"
            >
              {isMobileFitMode ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>크게 보기 (스크롤)</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>한눈에 보기 (화면 맞춤)</span>
                </>
              )}
            </button>
          </div>

          {/* Perspective toggle button */}
          <button
            onClick={onTogglePerspective}
            className="flex items-center space-x-1.5 text-xs text-slate-600 hover:text-indigo-700 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs ml-auto"
            title="교탁 시점과 학생 시점 전환"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>
              시점: {perspective === 'student' ? '학생 시점 (칠판 정면)' : '선생님 시점 (교탁 시점)'}
            </span>
          </button>
        </div>

        {/* Mobile horizontal scroll hint */}
        {!isMobileFitMode && (
          <div className="no-print md:hidden text-[11px] text-slate-400 text-center mt-1 flex items-center justify-center space-x-1">
            <span>👈 좌우로 스크롤하여 전체 좌석을 확인하세요 👉</span>
          </div>
        )}
      </div>

      {/* Classroom Desks Grid Container */}
      <div
        className={`w-full max-w-5xl pb-4 flex ${
          isMobileFitMode
            ? 'justify-center overflow-x-hidden'
            : 'overflow-x-auto justify-start md:justify-center'
        }`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div
          className={`inline-flex flex-col gap-2.5 sm:gap-3.5 p-1 sm:p-2 transition-transform duration-200 origin-top ${
            isMobileFitMode
              ? totalColsCount >= 7
                ? 'scale-[0.52] sm:scale-75 origin-top'
                : totalColsCount >= 5
                ? 'scale-[0.62] sm:scale-85 origin-top'
                : 'scale-[0.75] origin-top'
              : 'min-w-max'
          }`}
        >
          {displayRows.map((rowDesks, rIdx) => {
            const actualRowNumber = perspective === 'teacher' ? maxRow - rIdx + 1 : rIdx + 1;

            return (
              <div key={`row-${rIdx}`} className="flex items-center">
                {/* Row Label (Left) */}
                <span className="no-print w-7 sm:w-9 text-[11px] sm:text-xs font-bold text-slate-400 text-center mr-1 sm:mr-2 shrink-0">
                  {actualRowNumber}열
                </span>

                {/* Desk Items in Row */}
                <div className="flex items-center">
                  {rowDesks.map((desk) => {
                    const student = desk.studentId ? studentMap.get(desk.studentId) : null;
                    const isSelected = selectedCellId === desk.id;
                    const hasAisle = hasAisleAfterCol(desk.col);
                    const isRevealed = desk.isRevealed;

                    return (
                      <div
                        key={desk.id}
                        className={`flex items-center ${
                          hasAisle ? 'mr-3 sm:mr-8' : 'mr-1.5 sm:mr-3'
                        }`}
                      >
                        {/* Desk Box */}
                        {!desk.isActive ? (
                          <div
                            onClick={() => handleCellClick(desk)}
                            className={`w-20 sm:w-28 h-16 sm:h-20 rounded-xl border border-dashed flex items-center justify-center transition-all ${
                              isEditGridMode
                                ? 'border-indigo-300 bg-indigo-50/40 hover:bg-indigo-100 cursor-pointer text-indigo-400'
                                : 'border-slate-200 bg-slate-50/50 text-slate-300 pointer-events-none'
                            }`}
                          >
                            <span className="text-[10px] sm:text-[11px] font-medium">
                              {isEditGridMode ? '+ 추가' : '빈자리'}
                            </span>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleCellClick(desk)}
                            className={`relative w-20 sm:w-28 h-16 sm:h-20 rounded-xl border transition-all duration-300 cursor-pointer perspective-1000 group ${
                              isSelected
                                ? 'ring-3 ring-indigo-500 border-indigo-600 shadow-md scale-105 z-10'
                                : 'hover:shadow-md hover:border-indigo-300'
                            } ${
                              isRevealed
                                ? 'bg-white border-slate-300 shadow-xs'
                                : 'bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-700 shadow-sm text-white'
                            }`}
                          >
                            {/* Card Content */}
                            {isRevealed ? (
                              <div className="w-full h-full p-1.5 sm:p-2 flex flex-col justify-between">
                                {/* Top metadata */}
                                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
                                  <span className="font-mono text-[9px] sm:text-[10px] text-slate-400">
                                    {desk.row + 1}-{desk.col + 1}
                                  </span>
                                  {student?.number && (
                                    <span className="bg-slate-100 text-slate-600 font-bold px-1 sm:px-1.5 py-0.2 rounded text-[9px] sm:text-[10px]">
                                      {student.number}번
                                    </span>
                                  )}
                                  {desk.isFixed && (
                                    <span
                                      className="no-print text-[8px] sm:text-[9px] bg-amber-100 text-amber-700 px-1 rounded font-bold"
                                      title="교사 지정석"
                                    >
                                      고정
                                    </span>
                                  )}
                                </div>

                                {/* Student Name */}
                                <div className="text-center my-auto px-0.5">
                                  <span className="text-xs sm:text-base font-extrabold text-slate-800 tracking-tight block truncate">
                                    {student ? student.name : '(빈 책상)'}
                                  </span>
                                </div>

                                {/* Bottom subtle indicator */}
                                <div className="text-[9px] sm:text-[10px] text-center text-slate-400 font-medium">
                                  책상
                                </div>
                              </div>
                            ) : (
                              /* Mystery Hidden State */
                              <div className="w-full h-full flex flex-col items-center justify-center p-1 sm:p-2">
                                <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-indigo-800/80 border border-indigo-600 flex items-center justify-center mb-0.5 sm:mb-1">
                                  <span className="text-[11px] sm:text-xs font-black text-amber-300">?</span>
                                </div>
                                <span className="text-[9px] sm:text-[10px] font-mono text-indigo-300">
                                  {desk.row + 1}열 {desk.col + 1}
                                </span>
                              </div>
                            )}

                            {/* Desk Leg styling at bottom */}
                            <div className="absolute -bottom-1 left-2 right-2 h-1 bg-slate-300 rounded-b opacity-60"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Swap Guidance (no-print) */}
      <div className="no-print mt-2 sm:mt-3 text-[11px] sm:text-xs text-slate-500 flex flex-wrap items-center justify-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-center">
        <span className="font-semibold text-slate-700">💡 좌석 수동 변경:</span>
        <span>서로 바꿀 두 자리를 차례로 클릭하면 학생 위치가 바로 교환됩니다.</span>
      </div>
    </div>
  );
};
