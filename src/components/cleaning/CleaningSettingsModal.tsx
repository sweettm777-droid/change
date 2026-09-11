import React, { useState } from 'react';
import {
  X,
  Sliders,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  UserCheck,
  UserX,
  Sparkles,
  Edit2,
} from 'lucide-react';
import { CleaningArea, Student } from '../../types';
import { INITIAL_CLEANING_AREAS } from '../../data/defaultData';

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
  // Local clone of areas
  const [localAreas, setLocalAreas] = useState<CleaningArea[]>(() =>
    JSON.parse(JSON.stringify(areas))
  );
  const [localExcluded, setLocalExcluded] = useState<string[]>(() => [...excludedStudents]);

  // Form for adding new area
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newSubTitle, setNewSubTitle] = useState('');
  const [newCount, setNewCount] = useState<number>(1);

  if (!isOpen) return null;

  // Toggle excluded student
  const handleToggleExclude = (studentName: string) => {
    if (localExcluded.includes(studentName)) {
      setLocalExcluded(localExcluded.filter((n) => n !== studentName));
    } else {
      setLocalExcluded([...localExcluded, studentName]);
    }
  };

  // Change count of a sub-item
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

  // Delete sub-item or entire area
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

  // Add new custom area
  const handleAddNewArea = () => {
    if (!newCategory.trim() || !newSubTitle.trim()) {
      alert('구역명(담당)과 세부 내용을 입력해주세요.');
      return;
    }

    const newAreaItem: CleaningArea = {
      id: `custom-area-${Date.now()}`,
      category: newCategory.trim(),
      subItems: [
        {
          id: `custom-sub-${Date.now()}`,
          title: newSubTitle.trim(),
          count: newCount,
          fixedStudents: [],
          assignedStudents: [],
        },
      ],
    };

    setLocalAreas([...localAreas, newAreaItem]);
    setNewCategory('');
    setNewSubTitle('');
    setNewCount(1);
    setIsAddingArea(false);
  };

  const handleSaveAndApply = () => {
    onSave(localAreas, localExcluded);
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('첨부파일의 기본 9반 청소구역표 데이터로 되돌리시겠습니까?')) {
      setLocalAreas(JSON.parse(JSON.stringify(INITIAL_CLEANING_AREAS)));
      setLocalExcluded([]);
      onResetDefault();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">청소구역 특별 주문 및 구역 설정</h3>
              <p className="text-xs text-slate-400">
                첨부파일의 음영 고정 인원(준나, 배민서, 시연 등)을 관리하고 구역 및 인원수를 추가·수정합니다.
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Excluded students (청소 제외 학생 - 반장, 회장 등) */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserX className="w-4 h-4 text-rose-500" />
                <h4 className="font-bold text-slate-800 text-sm">청소구역 배정 제외 학생</h4>
              </div>
              <span className="text-xs text-slate-500">
                {localExcluded.length > 0 ? `${localExcluded.length}명 제외됨` : '모두 참여'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              학급 임원(반장/부반장)이나 장기 결석, 건강상 이유 등으로 청소 배정에서 제외할 학생을 클릭하세요.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {students.map((s) => {
                const isExcluded = localExcluded.includes(s.name);
                return (
                  <button
                    key={s.id}
                    onClick={() => handleToggleExclude(s.name)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                      isExcluded
                        ? 'bg-rose-100 border-rose-300 text-rose-800 line-through'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Cleaning Zones & Shaded (Fixed) Students */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>청소 구역 및 음영 고정(지정) 인원 관리</span>
              </h4>
              <button
                onClick={() => setIsAddingArea(!isAddingArea)}
                className="flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>청소 구역 추가</span>
              </button>
            </div>

            {/* Add New Area Inline Form */}
            {isAddingArea && (
              <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                <h5 className="font-bold text-xs text-indigo-900">새 청소구역 추가하기</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="담당 명칭 (예: 급식실)"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="세부 내용 (예: 배식대 닦기)"
                    value={newSubTitle}
                    onChange={(e) => setNewSubTitle(e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                  <div className="flex space-x-2 items-center">
                    <span className="text-xs text-slate-600 shrink-0">인원수:</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={newCount}
                      onChange={(e) => setNewCount(Math.max(1, Number(e.target.value)))}
                      className="w-16 text-xs border border-slate-300 rounded-lg p-2 bg-white text-center font-bold"
                    />
                    <button
                      onClick={handleAddNewArea}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shrink-0"
                    >
                      추가
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Area List Table */}
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {localAreas.map((area) => (
                <div key={area.id} className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {area.category.replace('\n', ' ')}
                    </span>
                  </div>

                  <div className="space-y-2 pl-2">
                    {area.subItems.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div className="flex-1">
                          <span className="font-semibold text-slate-800 block">
                            {sub.title.replace('\n', ' ')}
                          </span>
                        </div>

                        {/* Count controller */}
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-500 text-[11px]">필요 인원:</span>
                          <div className="flex items-center border border-slate-300 rounded-md bg-white">
                            <button
                              onClick={() => handleCountChange(area.id, sub.id, -1)}
                              className="px-2 py-0.5 text-slate-500 hover:bg-slate-100"
                            >
                              -
                            </button>
                            <span className="px-2 font-bold text-slate-800">{sub.count}명</span>
                            <button
                              onClick={() => handleCountChange(area.id, sub.id, 1)}
                              className="px-2 py-0.5 text-slate-500 hover:bg-slate-100"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Shaded / Fixed students selector */}
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-500 text-[11px] shrink-0">
                            음영 고정:
                          </span>
                          <select
                            onChange={(e) => {
                              handleAddFixedStudent(area.id, sub.id, e.target.value);
                              e.target.value = '';
                            }}
                            className="text-[11px] border border-slate-300 rounded-md p-1 bg-white"
                          >
                            <option value="">+ 고정 학생 추가</option>
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
                                  onClick={() => handleRemoveFixedStudent(area.id, sub.id, fixedName)}
                                  className="text-slate-600 hover:text-rose-700 font-black ml-0.5"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Delete sub-item */}
                        <button
                          onClick={() => handleDeleteSubItem(area.id, sub.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          title="구역 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-200/60"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>첨부파일 9반 기본표로 초기화</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100"
            >
              취소
            </button>
            <button
              onClick={handleSaveAndApply}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs flex items-center space-x-1.5"
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
