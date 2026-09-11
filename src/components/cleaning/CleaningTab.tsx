import React, { useState, useRef, useEffect } from 'react';
import { CleaningArea, Student } from '../../types';
import { INITIAL_CLEANING_AREAS } from '../../data/defaultData';
import { CleaningDutyTable } from './CleaningDutyTable';
import { CleaningSettingsModal } from './CleaningSettingsModal';
import {
  Shuffle,
  Printer,
  Download,
  Sliders,
  Sparkles,
  Check,
  Copy,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { solveCleaningDuty } from '../../utils/cleaningAlgorithm';
import { exportAsJpg, copyImageToClipboard, triggerPrint } from '../../utils/exportUtils';
import { soundEffects } from '../../utils/audio';

interface CleaningTabProps {
  students: Student[];
}

export const CleaningTab: React.FC<CleaningTabProps> = ({ students }) => {
  const [classNameTitle, setClassNameTitle] = useState<string>('9반');

  // Areas state
  const [areas, setAreas] = useState<CleaningArea[]>(() => {
    const saved = localStorage.getItem('app_cleaning_areas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_CLEANING_AREAS;
  });

  // Excluded students
  const [excludedStudents, setExcludedStudents] = useState<string[]>(() => {
    const saved = localStorage.getItem('app_cleaning_excluded');
    return saved ? JSON.parse(saved) : [];
  });

  // Reveal state
  const [isRevealed, setIsRevealed] = useState<boolean>(() => {
    return areas.some((a) => a.subItems.some((s) => s.assignedStudents.length > 0));
  });

  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('app_cleaning_areas', JSON.stringify(areas));
  }, [areas]);

  useEffect(() => {
    localStorage.setItem('app_cleaning_excluded', JSON.stringify(excludedStudents));
  }, [excludedStudents]);

  // Start Random Assignment with Dramatic Roulette Rolling Effect
  const handleStartRandomAssignment = () => {
    setIsRolling(true);
    soundEffects.playHeartbeat();

    // Rapid drum ticks during rolling
    let tickCount = 0;
    const interval = window.setInterval(() => {
      soundEffects.playDrumRollTick(1.0 + tickCount * 0.05);
      tickCount++;
      if (tickCount >= 10) {
        clearInterval(interval);
        // Solve final assignment
        const solved = solveCleaningDuty(areas, students, excludedStudents);
        setAreas(solved);
        setIsRevealed(true);
        setIsRolling(false);
        soundEffects.playFanfare();

        // Confetti
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // catch
        }
      }
    }, 120);
  };

  // Export as JPG
  const handleExportJpg = async () => {
    if (!printAreaRef.current) return;
    setIsExporting(true);
    try {
      await exportAsJpg(
        printAreaRef.current,
        `${classNameTitle}_청소구역표_${new Date().toISOString().slice(0, 10)}.jpg`
      );
    } catch (err) {
      alert('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  // Copy Image
  const handleCopyClipboard = async () => {
    if (!printAreaRef.current) return;
    const ok = await copyImageToClipboard(printAreaRef.current);
    if (ok) {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } else {
      alert('클립보드 복사를 지원하지 않는 브라우저입니다. JPG 저장을 이용해주세요.');
    }
  };

  // Total required slots
  let totalSlots = 0;
  areas.forEach((a) => {
    a.subItems.forEach((s) => {
      totalSlots += s.count;
    });
  });

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="no-print bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Class Name & Quick Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-600">학급 명칭:</span>
              <input
                type="text"
                value={classNameTitle}
                onChange={(e) => setClassNameTitle(e.target.value)}
                placeholder="예: 9반, 3학년 2반"
                className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1.5 w-28 text-center bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-500 pl-2 border-l border-slate-200">
              <span>총 대상 학생: <b className="text-slate-800">{students.length}명</b></span>
              <span>필요 청소 인원: <b className="text-emerald-700">{totalSlots}명</b></span>
              {excludedStudents.length > 0 && (
                <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-medium border border-rose-200">
                  {excludedStudents.length}명 제외됨
                </span>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Special Settings Modal Trigger */}
            <button
              id="btn-cleaning-settings"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-emerald-300 rounded-xl text-xs font-bold border border-slate-700 shadow-xs transition-colors"
              title="청소구역 추가/삭제, 인원수 조정, 음영 고정(준나, 배민서, 시연 등) 관리"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>청소구역 특별 설정</span>
            </button>

            {/* Random Assignment Trigger */}
            <button
              id="btn-start-cleaning-random"
              onClick={handleStartRandomAssignment}
              disabled={isRolling}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4" />
              <span>{isRolling ? '추첨 롤링 중...' : '청소구역 랜덤 배정하기!'}</span>
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
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isExporting ? '저장 중...' : 'JPG 다운로드'}</span>
            </button>

            {/* Copy Clipboard */}
            <button
              onClick={handleCopyClipboard}
              className="flex items-center space-x-1 px-2.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
              title="클립보드에 이미지 복사"
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

        {/* Rolling alert banner */}
        {isRolling && (
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-xl p-3 text-center text-xs font-bold animate-suspense-pulse shadow-md flex items-center justify-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" />
            <span>두근두근! 청소구역 무작위 추첨이 진행 중입니다...</span>
          </div>
        )}
      </div>

      {/* Target Table to Print / Export */}
      <div ref={printAreaRef}>
        <CleaningDutyTable
          classNameTitle={classNameTitle}
          areas={areas}
          isRevealed={isRevealed}
        />
      </div>

      {/* Cleaning Settings Modal */}
      <CleaningSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        areas={areas}
        students={students}
        excludedStudents={excludedStudents}
        onSave={(updatedAreas, newExcluded) => {
          setAreas(updatedAreas);
          setExcludedStudents(newExcluded);
          alert('청소구역 설정이 저장되었습니다. 랜덤 배정을 누르면 반영됩니다.');
        }}
        onResetDefault={() => {
          setAreas(INITIAL_CLEANING_AREAS);
          setExcludedStudents([]);
        }}
      />
    </div>
  );
};
