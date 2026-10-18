import React, { useState } from 'react';
import {
  X,
  Sliders,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  UserX,
  Sparkles,
  ArrowUp,
  ArrowDown,
  FileText,
  List,
  Wand2,
  HelpCircle,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { CleaningArea, Student } from '../../types';
import { INITIAL_CLEANING_AREAS } from '../../data/defaultData';
import {
  parseCleaningAreasText,
  stringifyCleaningAreas,
  CLEANING_PRESETS,
} from '../../utils/cleaningParser';

interface CleaningSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  areas: CleaningArea[];
  students: Student[];
  excludedStudents: string[];
  onSave: (updatedAreas: CleaningArea[], excludedStudents: string[]) => void;
  onResetDefault: () => void;
}

export const CleaningSettingsModal: React.FC<CleaningSettingsModalProps> = ({
  isOpen,
  onClose,
  areas,
  students,
  excludedStudents,
  onSave,
  onResetDefault,
}) => {
  // Active Tab: 'bulk' (free text input) | 'visual' (interactive list) | 'exclude' (excluded students)
  const [activeTab, setActiveTab] = useState<'bulk' | 'visual' | 'exclude'>('bulk');

  // Interactive visual editor state
  const [localAreas, setLocalAreas] = useState<CleaningArea[]>(() =>
    JSON.parse(JSON.stringify(areas))
  );
  const [localExcluded, setLocalExcluded] = useState<string[]>(() => [...excludedStudents]);

  // Bulk text editor state
  const [bulkText, setBulkText] = useState<string>(() => stringifyCleaningAreas(areas));
  const [bulkWarning, setBulkWarning] = useState<string | null>(null);

  // New category input for visual mode
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  if (!isOpen) return null;

  // Sync current visual localAreas to bulkText
  const handleLoadCurrentToText = () => {
    setBulkText(stringifyCleaningAreas(localAreas));
  };

  // Apply a preset in bulk text mode
  const handleApplyPreset = (presetText: string) => {
    setBulkText(presetText);
  };

  // Parse bulk text live for preview stats
  const parsedBulkAreas = parseCleaningAreasText(bulkText);
  const bulkTotalSlots = parsedBulkAreas.reduce(
    (sum, area) => sum + area.subItems.reduce((subSum, s) => subSum + s.count, 0),
    0
  );
  const visualTotalSlots = localAreas.reduce(
    (sum, area) => sum + area.subItems.reduce((subSum, s) => subSum + s.count, 0),
    0
  );

  // =================== Visual Mode Handlers ===================

  // Edit category name directly
  const handleUpdateCategoryName = (areaId: string, newName: string) => {
    setLocalAreas((prev) =>
      prev.map((a) => (a.id === areaId ? { ...a, category: newName } : a))
    );
  };

  // Edit sub-item title directly
  const handleUpdateSubTitle = (areaId: string, subId: string, newTitle: string) => {
    setLocalAreas((prev) =>
      prev.map((a) => {
        if (a.id !== areaId) return a;
        return {
          ...a,
          subItems: a.subItems.map((sub) =>
            sub.id === subId ? { ...sub, title: newTitle } : sub
          ),
        };
      })
    );
  };

  // Edit sub-item count directly
  const handleCountChange = (areaId: string, subId: string, delta: number) => {
    setLocalAreas((prev) =>
      prev.map((area) => {
        if (area.id !== areaId) return area;
        return {
          ...area,
          subItems: area.subItems.map((sub) => {
            if (sub.id !== subId) return sub;
            const nextCount = Math.max(1, sub.count + delta);
            return { ...sub, count: nextCount };
          }),
        };
      })
    );
  };

  const handleCountSet = (areaId: string, subId: string, val: number) => {
    const nextCount = Math.max(1, Math.min(20, val || 1));
    setLocalAreas((prev) =>
      prev.map((area) => {
        if (area.id !== areaId) return area;
        return {
          ...area,
          subItems: area.subItems.map((sub) =>
            sub.id === subId ? { ...sub, count: nextCount } : sub
          ),
        };
      })
    );
  };

  // Move category up / down
  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localAreas.length) return;
    const next = [...localAreas];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setLocalAreas(next);
  };

  // Move sub-item up / down
  const handleMoveSubItem = (areaId: string, index: number, direction: 'up' | 'down') => {
    setLocalAreas((prev) =>
      prev.map((area) => {
        if (area.id !== areaId) return area;
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= area.subItems.length) return area;
        const nextSubs = [...area.subItems];
        const temp = nextSubs[index];
        nextSubs[index] = nextSubs[targetIndex];
        nextSubs[targetIndex] = temp;
        return { ...area, subItems: nextSubs };
      })
    );
  };

  // Add new sub-item under existing category
  const handleAddSubItemToCategory = (areaId: string) => {
    setLocalAreas((prev) =>
      prev.map((area) => {
        if (area.id !== areaId) return area;
        return {
          ...area,
          subItems: [
            ...area.subItems,
            {
              id: `sub-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              title: '새 청소 세부구역',
              count: 1,
              fixedStudents: [],
              assignedStudents: [],
            },
          ],
        };
      })
    );
  };

  // Add brand new category
  const handleAddNewCategory = () => {
    if (!newCategoryName.trim()) return;
    const newArea: CleaningArea = {
      id: `area-custom-${Date.now()}`,
      category: newCategoryName.trim(),
      subItems: [
        {
          id: `sub-custom-${Date.now()}`,
          title: `${newCategoryName.trim()} 담당`,
          count: 1,
          fixedStudents: [],
          assignedStudents: [],
        },
      ],
    };
    setLocalAreas([...localAreas, newArea]);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  // Delete sub-item
  const handleDeleteSubItem = (areaId: string, subId: string) => {
    setLocalAreas((prev) =>
      prev
        .map((area) => {
          if (area.id !== areaId) return area;
          return {
            ...area,
            subItems: area.subItems.filter((s) => s.id !== subId),
          };
        })
        .filter((area) => area.subItems.length > 0)
    );
  };

  // Delete whole category
  const handleDeleteCategory = (areaId: string) => {
    if (window.confirm('이 청소 담당 분류와 하위 구역을 모두 삭제하시겠습니까?')) {
      setLocalAreas((prev) => prev.filter((a) => a.id !== areaId));
    }
  };

  // Add fixed student (음영 고정)
  const handleAddFixedStudent = (areaId: string, subId: string, studentName: string) => {
    if (!studentName) return;
    setLocalAreas((prev) =>
      prev.map((area) => {
        if (area.id !== areaId) return area;
        return {
          ...area,
          subItems: area.subItems.map((sub) => {
            if (sub.id !== subId) return sub;
            if (sub.fixedStudents.includes(studentName)) return sub;
            return {
              ...sub,
              fixedStudents: [...sub.fixedStudents, studentName],
            };
          }),
        };
      })
    );
  };

  // Remove fixed student
  const handleRemoveFixedStudent = (areaId: string, subId: string, studentName: string) => {
    setLocalAreas((prev) =>
      prev.map((area) => {
        if (area.id !== areaId) return area;
        return {
          ...area,
          subItems: area.subItems.map((sub) => {
            if (sub.id !== subId) return sub;
            return {
              ...sub,
              fixedStudents: sub.fixedStudents.filter((n) => n !== studentName),
            };
          }),
        };
      })
    );
  };

  // Toggle excluded student
  const handleToggleExclude = (studentName: string) => {
    if (localExcluded.includes(studentName)) {
      setLocalExcluded(localExcluded.filter((n) => n !== studentName));
    } else {
      setLocalExcluded([...localExcluded, studentName]);
    }
  };

  // =================== Save & Reset Handlers ===================

  const handleSaveAndApply = () => {
    let finalAreas: CleaningArea[] = [];

    if (activeTab === 'bulk') {
      const parsed = parseCleaningAreasText(bulkText);
      if (parsed.length === 0) {
        alert('입력된 청소구역이 없습니다. 내용을 입력해주세요.');
        return;
      }
      finalAreas = parsed;
    } else {
      if (localAreas.length === 0) {
        alert('최소 1개 이상의 청소구역이 필요합니다.');
        return;
      }
      finalAreas = localAreas;
    }

    onSave(finalAreas, localExcluded);
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('기본 청소구역 데이터로 초기화하시겠습니까?')) {
      const defaultAreas = JSON.parse(JSON.stringify(INITIAL_CLEANING_AREAS));
      setLocalAreas(defaultAreas);
      setBulkText(stringifyCleaningAreas(defaultAreas));
      setLocalExcluded([]);
      onResetDefault();
    }
  };

  // Active slots vs student count comparison
  const currentSlots = activeTab === 'bulk' ? bulkTotalSlots : visualTotalSlots;
  const availableStudentsCount = Math.max(0, students.length - localExcluded.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
                <span>청소구역 자유 설정 및 편집</span>
                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  자유 입력 지원
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                선생님 학급 상황에 맞춰 청소구역 이름, 세부 내용, 필요 인원수를 자유롭게 입력하고 변경하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 sm:px-6 pt-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                if (activeTab === 'visual') {
                  setBulkText(stringifyCleaningAreas(localAreas));
                }
                setActiveTab('bulk');
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'bulk'
                  ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>한 번에 자유 입력 (텍스트 / 줄바꿈)</span>
            </button>

            <button
              onClick={() => {
                if (activeTab === 'bulk') {
                  const parsed = parseCleaningAreasText(bulkText);
                  if (parsed.length > 0) setLocalAreas(parsed);
                }
                setActiveTab('visual');
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'visual'
                  ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>개별 직접 편집 (표 형태)</span>
            </button>

            <button
              onClick={() => setActiveTab('exclude')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'exclude'
                  ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserX className="w-3.5 h-3.5 text-rose-500" />
              <span>배정 제외 학생 ({localExcluded.length})</span>
            </button>
          </div>

          {/* Quick status bar */}
          <div className="flex items-center space-x-2 text-xs py-1">
            <span className="text-slate-500">
              필요 청소 인원: <b className="text-emerald-700 font-bold">{currentSlots}명</b>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">
              배정 가능 학생: <b className="text-slate-800 font-bold">{availableStudentsCount}명</b>
            </span>
            {currentSlots > availableStudentsCount && (
              <span className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-medium flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>학생 부족 ({currentSlots - availableStudentsCount}명)</span>
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: BULK TEXT INPUT */}
          {activeTab === 'bulk' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Presets and helpers */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
                    <Wand2 className="w-4 h-4 text-emerald-700" />
                    <span>추천 템플릿(프리셋)으로 1초 만에 불러오기:</span>
                  </div>
                  <button
                    onClick={handleLoadCurrentToText}
                    className="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs font-medium"
                    title="현재 설정된 청소구역 목록을 텍스트로 불러와 수정합니다"
                  >
                    <Copy className="w-3 h-3" />
                    <span>현재 설정된 구역 텍스트로 가져오기</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {CLEANING_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset.text)}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-100/70 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1"
                      title={preset.desc}
                    >
                      <span>⚡ {preset.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Free text area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold flex items-center space-x-1">
                    <span>자유 입력창 (줄바꿈 구분):</span>
                    <span className="text-slate-400 font-normal">
                      [담당 / 세부내용 / 인원수] 순서로 자유롭게 입력하세요.
                    </span>
                  </span>
                  <span className="text-slate-500">
                    인식된 분류: <b className="text-slate-800">{parsedBulkAreas.length}개</b> / 총 인원: <b className="text-emerald-700">{bulkTotalSlots}명</b>
                  </span>
                </div>

                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows={14}
                  className="w-full text-xs sm:text-sm font-medium border border-slate-300 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono leading-relaxed bg-slate-50/30"
                  placeholder={`예시:
교실 쓸기 / 교실 앞 / 1명
교실 쓸기 / 교실 가운데 / 2명
교실 쓸기 / 교실 뒤 / 1명
교실 닦기 / 교실 앞 / 1명
칠판 정리 / 칠판 닦고 걸레 빨기 / 2명
복도 / 쓸기 / 1명
분리수거 / 쓰레기 분리수거 / 1명`}
                />

                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span>💡 <b>팁</b>: 슬래시(/), 쉼표(,), 탭으로 구분할 수 있습니다. 인원수를 생략하면 자동으로 1명으로 지정됩니다.</span>
                  <span className="text-emerald-700 font-medium">※ 입력 후 [설정 저장 및 적용]을 누르면 즉시 표에 반영됩니다.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED INTERACTIVE LIST / TABLE EDIT */}
          {activeTab === 'visual' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-600">
                  각 구역의 <b>담당 분류명, 세부 내용, 필요 인원수</b>를 글상자에서 직접 클릭하여 자유롭게 수정할 수 있습니다.
                </div>
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className="flex items-center space-x-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>새 담당 분류 추가</span>
                </button>
              </div>

              {/* Add category inline form */}
              {isAddingCategory && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-emerald-900">새 분류명:</span>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNewCategory()}
                    placeholder="예: 특별실, 급식실, 재활용 등"
                    className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white w-48 font-medium focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                  <button
                    onClick={handleAddNewCategory}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold"
                  >
                    추가
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryName('');
                    }}
                    className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                  >
                    취소
                  </button>
                </div>
              )}

              {/* Category & Subitems list */}
              <div className="space-y-4">
                {localAreas.map((area, areaIdx) => (
                  <div
                    key={area.id}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs"
                  >
                    {/* Category Header */}
                    <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
                        <span className="text-xs font-bold text-slate-500 shrink-0">담당 분류:</span>
                        <input
                          type="text"
                          value={area.category}
                          onChange={(e) => handleUpdateCategoryName(area.id, e.target.value)}
                          className="text-xs font-extrabold text-slate-900 bg-white border border-slate-300 rounded-md px-2 py-1 w-full max-w-xs focus:ring-2 focus:ring-emerald-500"
                          title="담당 분류명을 직접 수정할 수 있습니다"
                        />
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleAddSubItemToCategory(area.id)}
                          className="flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md"
                          title="이 담당 아래에 세부 구역을 추가합니다"
                        >
                          <Plus className="w-3 h-3" />
                          <span>세부구역 추가</span>
                        </button>

                        {/* Move category up / down */}
                        <button
                          onClick={() => handleMoveCategory(areaIdx, 'up')}
                          disabled={areaIdx === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          title="위로 이동"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveCategory(areaIdx, 'down')}
                          disabled={areaIdx === localAreas.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          title="아래로 이동"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete category */}
                        <button
                          onClick={() => handleDeleteCategory(area.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="이 분류 전체 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Sub-items in Category */}
                    <div className="divide-y divide-slate-100 p-2 space-y-2">
                      {area.subItems.map((sub, subIdx) => (
                        <div
                          key={sub.id}
                          className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50/60 border border-slate-200/60 hover:bg-slate-50 transition-colors"
                        >
                          {/* Duty content input */}
                          <div className="flex-1 min-w-[200px]">
                            <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                              세부 내용 / 구역명:
                            </span>
                            <input
                              type="text"
                              value={sub.title}
                              onChange={(e) =>
                                handleUpdateSubTitle(area.id, sub.id, e.target.value)
                              }
                              className="text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 w-full focus:ring-2 focus:ring-emerald-500"
                              title="세부 구역 내용을 직접 수정할 수 있습니다"
                            />
                          </div>

                          {/* Controls row */}
                          <div className="flex flex-wrap items-center gap-3">
                            {/* Count controller */}
                            <div className="flex items-center space-x-1.5">
                              <span className="text-slate-500 text-xs font-medium shrink-0">인원:</span>
                              <div className="flex items-center border border-slate-300 rounded-md bg-white">
                                <button
                                  onClick={() => handleCountChange(area.id, sub.id, -1)}
                                  className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  max={20}
                                  value={sub.count}
                                  onChange={(e) =>
                                    handleCountSet(area.id, sub.id, parseInt(e.target.value, 10))
                                  }
                                  className="w-10 text-center text-xs font-extrabold text-slate-800 border-none p-0 focus:ring-0"
                                />
                                <span className="text-xs text-slate-400 pr-1">명</span>
                                <button
                                  onClick={() => handleCountChange(area.id, sub.id, 1)}
                                  className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Shaded (Fixed) students selector */}
                            <div className="flex items-center space-x-1.5">
                              <select
                                onChange={(e) => {
                                  handleAddFixedStudent(area.id, sub.id, e.target.value);
                                  e.target.value = '';
                                }}
                                className="text-xs border border-slate-300 rounded-md px-2 py-1 bg-white text-slate-700"
                              >
                                <option value="">+ 음영 고정 학생</option>
                                {students
                                  .filter((st) => !sub.fixedStudents.includes(st.name))
                                  .map((st) => (
                                    <option key={st.id} value={st.name}>
                                      {st.name}
                                    </option>
                                  ))}
                              </select>
                            </div>

                            {/* Shaded badges */}
                            {sub.fixedStudents.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1">
                                {sub.fixedStudents.map((fixedName) => (
                                  <span
                                    key={fixedName}
                                    className="inline-flex items-center space-x-1 bg-slate-300 text-slate-900 border border-slate-400 font-bold px-1.5 py-0.5 rounded text-[10px]"
                                    title="음영 처리 고정 담당자"
                                  >
                                    <span>{fixedName}</span>
                                    <button
                                      onClick={() =>
                                        handleRemoveFixedStudent(area.id, sub.id, fixedName)
                                      }
                                      className="text-slate-600 hover:text-rose-700 font-black ml-0.5"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Move sub-item up / down */}
                            <div className="flex items-center">
                              <button
                                onClick={() => handleMoveSubItem(area.id, subIdx, 'up')}
                                disabled={subIdx === 0}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                title="위로 이동"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveSubItem(area.id, subIdx, 'down')}
                                disabled={subIdx === area.subItems.length - 1}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                title="아래로 이동"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Delete sub-item */}
                            <button
                              onClick={() => handleDeleteSubItem(area.id, sub.id)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors rounded hover:bg-rose-50"
                              title="세부구역 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: EXCLUDED STUDENTS */}
          {activeTab === 'exclude' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserX className="w-4 h-4 text-rose-500" />
                    <h4 className="font-bold text-slate-800 text-sm">
                      청소구역 배정 제외 학생 (임원, 결석생 등)
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {localExcluded.length > 0 ? `${localExcluded.length}명 제외됨` : '전원 청소 참여'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  학급 회장/부회장 등 임원 역할을 맡고 있거나, 장기 결석, 건강상 이유 등으로 청소 배정에서
                  제외할 학생을 클릭하세요. 클릭된 학생은 무작위 자동 추첨에서 제외됩니다.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {students.map((s) => {
                    const isExcluded = localExcluded.includes(s.name);
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleToggleExclude(s.name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs ${
                          isExcluded
                            ? 'bg-rose-100 border-rose-300 text-rose-800 line-through ring-1 ring-rose-400'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {s.name}
                        {isExcluded && <span className="ml-1 text-[10px] text-rose-600 font-normal">(제외)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-200/60 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>기본 청소구역으로 되돌리기</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-medium hover:bg-slate-100"
            >
              취소
            </button>
            <button
              onClick={handleSaveAndApply}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>설정 저장 및 적용</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
