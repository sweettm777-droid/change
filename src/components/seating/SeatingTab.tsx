import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  DeskCell,
  LayoutMode,
  SeatingLayoutConfig,
  Student,
  TeacherConstraints,
} from '../../types';
import { DeskGrid } from './DeskGrid';
import { SuspenseController } from './SuspenseController';
import { TeacherSettingsModal } from './TeacherSettingsModal';
import {
  Shuffle,
  Printer,
  Download,
  Lock,
  Grid,
  Columns,
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
  Copy,
} from 'lucide-react';
import {
  generateDeskGrid,
  solveSeatingArrangement,
} from '../../utils/seatingAlgorithm';
import { exportAsJpg, copyImageToClipboard, triggerPrint } from '../../utils/exportUtils';
import { soundEffects } from '../../utils/audio';

interface SeatingTabProps {
  students: Student[];
}

const DEFAULT_CONFIG: SeatingLayoutConfig = {
  mode: 'pair',
  rows: 4,
  cols: 6,
  pairGapEvery: 2,
  singleCols: [4], // for hybrid mode: 5th col is single
};

const DEFAULT_CONSTRAINTS: TeacherConstraints = {
  pin: '0000',
  isPinRequired: false,
  separationPairs: [],
  fixedAssignments: [],
};

export const SeatingTab: React.FC<SeatingTabProps> = ({ students }) => {
  // Config state
  const [config, setConfig] = useState<SeatingLayoutConfig>(() => {
    const saved = localStorage.getItem('app_seating_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  // Constraints state (Teacher secret)
  const [constraints, setConstraints] = useState<TeacherConstraints>(() => {
    const saved = localStorage.getItem('app_teacher_constraints');
    return saved ? JSON.parse(saved) : DEFAULT_CONSTRAINTS;
  });

  // Perspective state
  const [perspective, setPerspective] = useState<'student' | 'teacher'>('student');

  // Teacher secret modal state
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  // Edit grid mode toggle
  const [isEditGridMode, setIsEditGridMode] = useState(false);

  // Desks state
  const [desks, setDesks] = useState<DeskCell[]>(() => {
    const saved = localStorage.getItem('app_seating_desks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    const initial = generateDeskGrid(DEFAULT_CONFIG, students.length);
    // Auto solve initially
    const result = solveSeatingArrangement(initial, students, DEFAULT_CONSTRAINTS);
    return result.cells.map((c) => ({ ...c, isRevealed: true }));
  });

  // Suspense & Reveal state
  const [isRevealing, setIsRevealing] = useState(false);
  const [isAutoRevealing, setIsAutoRevealing] = useState(false);
  const [revealOrder, setRevealOrder] = useState<string[]>([]);
  const [currentRevealIdx, setCurrentRevealIdx] = useState(0);

  // Print/Export target ref
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Save config & constraints to localStorage
  useEffect(() => {
    localStorage.setItem('app_seating_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('app_teacher_constraints', JSON.stringify(constraints));
  }, [constraints]);

  useEffect(() => {
    localStorage.setItem('app_seating_desks', JSON.stringify(desks));
  }, [desks]);

  // Handle Mode Change (Pair, Exam, Hybrid, Custom)
  const handleModeChange = (mode: LayoutMode) => {
    const newConfig = { ...config, mode };
    setConfig(newConfig);

    // Re-generate grid matching mode
    const newGrid = generateDeskGrid(newConfig, students.length);
    const result = solveSeatingArrangement(newGrid, students, constraints);
    setDesks(result.cells.map((c) => ({ ...c, isRevealed: true })));
    setIsRevealing(false);
    setIsAutoRevealing(false);
  };

  // Start Dramatic Shuffle & Suspense Reveal
  const handleStartShuffle = () => {
    // 1. Solve layout with constraints
    const result = solveSeatingArrangement(desks, students, constraints);

    // 2. Hide all cards
    const hiddenCells = result.cells.map((c) => ({
      ...c,
      isRevealed: false,
    }));
    setDesks(hiddenCells);

    // 3. Prepare randomized reveal sequence
    const activeCellIds = hiddenCells.filter((c) => c.isActive && c.studentId).map((c) => c.id);

    // Shuffle reveal order for suspense
    const randomizedOrder = [...activeCellIds].sort(() => Math.random() - 0.5);

    setRevealOrder(randomizedOrder);
    setCurrentRevealIdx(0);
    setIsRevealing(true);
    setIsAutoRevealing(false);

    // Sound effect
    soundEffects.playHeartbeat();
  };

  // Reveal next seat
  const handleRevealNext = useCallback(() => {
    if (currentRevealIdx >= revealOrder.length) return;

    const targetCellId = revealOrder[currentRevealIdx];
    setDesks((prev) =>
      prev.map((c) => (c.id === targetCellId ? { ...c, isRevealed: true } : c))
    );
    setCurrentRevealIdx((prev) => prev + 1);
    soundEffects.playCardReveal();
  }, [currentRevealIdx, revealOrder]);

  // Reveal all seats immediately
  const handleRevealAll = () => {
    setDesks((prev) => prev.map((c) => ({ ...c, isRevealed: true })));
    setCurrentRevealIdx(revealOrder.length);
    setIsAutoRevealing(false);
    soundEffects.playFanfare();
  };

  // Reset reveal to hide again
  const handleResetReveal = () => {
    setDesks((prev) => prev.map((c) => ({ ...c, isRevealed: false })));
    setCurrentRevealIdx(0);
    setIsAutoRevealing(false);
  };

  // Swap two students manually
  const handleSwapStudents = (cellIdA: string, cellIdB: string) => {
    setDesks((prev) => {
      const cellA = prev.find((c) => c.id === cellIdA);
      const cellB = prev.find((c) => c.id === cellIdB);
      if (!cellA || !cellB) return prev;

      return prev.map((c) => {
        if (c.id === cellIdA) return { ...c, studentId: cellB.studentId, isRevealed: true };
        if (c.id === cellIdB) return { ...c, studentId: cellA.studentId, isRevealed: true };
        return c;
      });
    });
  };

  // Toggle active/inactive desk (in edit mode)
  const handleToggleDeskActive = (cellId: string) => {
    setDesks((prev) =>
      prev.map((c) => (c.id === cellId ? { ...c, isActive: !c.isActive, studentId: null } : c))
    );
  };

  // Export as JPG
  const handleExportJpg = async () => {
    if (!printAreaRef.current) return;
    setIsExporting(true);
    try {
      await exportAsJpg(printAreaRef.current, `학급자리배치표_${new Date().toISOString().slice(0, 10)}.jpg`);
    } catch (err) {
      alert('이미지 저장 중 오류가 발생했습니다. 브라우저 설정을 확인해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  // Copy to clipboard
  const handleCopyClipboard = async () => {
    if (!printAreaRef.current) return;
    const ok = await copyImageToClipboard(printAreaRef.current);
    if (ok) {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } else {
      alert('클립보드 복사가 지원되지 않는 브라우저입니다. JPG 저장을 이용해주세요.');
    }
  };

  // Total active seats
  const activeDesks = desks.filter((d) => d.isActive && d.studentId);
  const revealedCount = desks.filter((d) => d.isActive && d.studentId && d.isRevealed).length;

  return (
    <div className="space-y-6">
      {/* Control Action Toolbar */}
      <div className="no-print bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Layout Modes */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center">
              <Grid className="w-3.5 h-3.5 mr-1 text-slate-400" />
              배치 형태:
            </span>

            {/* Mode: Pair */}
            <button
              onClick={() => handleModeChange('pair')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                config.mode === 'pair'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>짝꿍 분단형 (2인 1조)</span>
            </button>

            {/* Mode: Exam */}
            <button
              onClick={() => handleModeChange('exam')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                config.mode === 'exam'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>시험 대형 (1인 1석)</span>
            </button>

            {/* Mode: Hybrid */}
            <button
              onClick={() => handleModeChange('hybrid')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                config.mode === 'hybrid'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>하이브리드형 (짝꿍 + 1인석)</span>
            </button>

            {/* Grid Edit Toggle */}
            <button
              onClick={() => setIsEditGridMode(!isEditGridMode)}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isEditGridMode
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="책상 유무를 직접 클릭해서 통로/빈자리 만들기"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isEditGridMode ? '좌석 편집 완료' : '책상 켜기/끄기'}</span>
            </button>
          </div>

          {/* Right: Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Teacher Secret Settings Button */}
            <button
              id="btn-teacher-secret-settings"
              onClick={() => setIsTeacherModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-amber-300 rounded-xl text-xs font-bold border border-slate-700 shadow-xs transition-colors"
              title="교사만 볼 수 있는 특별 규칙 (꼭 떼어놔야 하는 둘, 지정석)"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>교사 전용 비밀 설정</span>
              {(constraints.separationPairs.length > 0 ||
                constraints.fixedAssignments.length > 0) && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              )}
            </button>

            {/* Shuffle & Reveal Button */}
            <button
              id="btn-start-shuffle"
              onClick={handleStartShuffle}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <Shuffle className="w-4 h-4" />
              <span>자리 섞기 & 공개 시작!</span>
            </button>

            {/* Print Button */}
            <button
              onClick={triggerPrint}
              className="flex items-center space-x-1 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
              title="A4 용지 인쇄"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>인쇄</span>
            </button>

            {/* JPG Download Button */}
            <button
              onClick={handleExportJpg}
              disabled={isExporting}
              className="flex items-center space-x-1 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
              title="JPG 고화질 이미지 저장"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isExporting ? '저장 중...' : 'JPG 다운로드'}</span>
            </button>

            {/* Copy Clipboard */}
            <button
              onClick={handleCopyClipboard}
              className="flex items-center space-x-1 px-2.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
              title="클립보드에 이미지 복사 (한글/문서에 바로 붙여넣기 가능)"
            >
              {copyFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">복사됨!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Secondary controls row: Grid size & Hybrid column toggle */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-100 gap-3">
          {/* Row & Col counters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span>행(줄 수):</span>
              <select
                value={config.rows}
                onChange={(e) => {
                  const rows = Number(e.target.value);
                  const newCfg = { ...config, rows };
                  setConfig(newCfg);
                  const newGrid = generateDeskGrid(newCfg, students.length);
                  const res = solveSeatingArrangement(newGrid, students, constraints);
                  setDesks(res.cells.map((c) => ({ ...c, isRevealed: true })));
                }}
                className="border border-slate-200 rounded-lg px-2 py-1 bg-white font-medium"
              >
                {[3, 4, 5, 6, 7].map((num) => (
                  <option key={num} value={num}>
                    {num}줄
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              <span>열(분단 가로 수):</span>
              <select
                value={config.cols}
                onChange={(e) => {
                  const cols = Number(e.target.value);
                  const newCfg = { ...config, cols };
                  setConfig(newCfg);
                  const newGrid = generateDeskGrid(newCfg, students.length);
                  const res = solveSeatingArrangement(newGrid, students, constraints);
                  setDesks(res.cells.map((c) => ({ ...c, isRevealed: true })));
                }}
                className="border border-slate-200 rounded-lg px-2 py-1 bg-white font-medium"
              >
                {[4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num}열
                  </option>
                ))}
              </select>
            </div>

            {/* Hybrid Single Column Choice */}
            {config.mode === 'hybrid' && (
              <div className="flex items-center space-x-2 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                <span className="font-semibold text-indigo-900">단독 1인석 열:</span>
                {Array.from({ length: config.cols }, (_, i) => (
                  <label key={i} className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.singleCols.includes(i)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...config.singleCols, i]
                          : config.singleCols.filter((c) => c !== i);
                        const newCfg = { ...config, singleCols: next };
                        setConfig(newCfg);
                        const newGrid = generateDeskGrid(newCfg, students.length);
                        const res = solveSeatingArrangement(newGrid, students, constraints);
                        setDesks(res.cells.map((c) => ({ ...c, isRevealed: true })));
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-indigo-800 font-mono">{i + 1}열</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Quick stats info */}
          <div className="flex items-center space-x-3 text-slate-500">
            <span>총 학생: <b className="text-slate-800">{students.length}명</b></span>
            <span>배치 좌석: <b className="text-indigo-700">{activeDesks.length}석</b></span>
            {isEditGridMode && (
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                원하지 않는 좌석을 클릭하면 빈자리(통로)로 바뀝니다.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Suspense Reveal Controller (When revealing or after reveal) */}
      {isRevealing && (
        <SuspenseController
          isRevealing={isRevealing}
          totalSeats={activeDesks.length}
          revealedCount={revealedCount}
          onRevealNext={handleRevealNext}
          onRevealAll={handleRevealAll}
          onResetReveal={handleResetReveal}
          onAutoRevealToggle={setIsAutoRevealing}
          isAutoRevealing={isAutoRevealing}
        />
      )}

      {/* Printable / Exportable Classroom Grid Area */}
      <div
        ref={printAreaRef}
        className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm printable-area"
      >
        {/* Printable Title Bar (Printed on top of page / JPG export) */}
        <div className="mb-6 text-center border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            우리 반 자리 배치표
          </h2>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-center space-x-3">
            <span>작성일자: {new Date().toLocaleDateString('ko-KR')}</span>
            <span>·</span>
            <span>총원: {students.length}명</span>
            <span>·</span>
            <span>배치 형태: {
              config.mode === 'pair' ? '짝꿍 분단형' : config.mode === 'exam' ? '시험 대형' : '하이브리드형'
            }</span>
          </div>
        </div>

        {/* Visual Classroom Desk Grid */}
        <DeskGrid
          desks={desks}
          students={students}
          layoutMode={config.mode}
          singleCols={config.singleCols}
          perspective={perspective}
          onTogglePerspective={() =>
            setPerspective((prev) => (prev === 'student' ? 'teacher' : 'student'))
          }
          onSwapStudents={handleSwapStudents}
          onToggleDeskActive={handleToggleDeskActive}
          isEditGridMode={isEditGridMode}
        />
      </div>

      {/* Teacher Secret Settings Modal */}
      <TeacherSettingsModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        students={students}
        desks={desks}
        constraints={constraints}
        onSaveConstraints={(newConstraints) => {
          setConstraints(newConstraints);
          // Re-solve with updated constraints
          const result = solveSeatingArrangement(desks, students, newConstraints);
          setDesks(result.cells.map((c) => ({ ...c, isRevealed: true })));
          alert('교사 비밀 설정이 성공적으로 저장 및 적용되었습니다.');
        }}
      />
    </div>
  );
};
