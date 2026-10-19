import React, { useState } from 'react';
import { X, Users, RotateCcw, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Student } from '../types';
import { INITIAL_STUDENTS } from '../data/defaultData';

interface StudentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSaveStudents: (newStudents: Student[]) => void;
}

export const StudentManagerModal: React.FC<StudentManagerModalProps> = ({
  isOpen,
  onClose,
  students,
  onSaveStudents,
}) => {
  const [inputText, setInputText] = useState(() =>
    students.map((s) => s.name).join('\n')
  );
  const [activeSubTab, setActiveSubTab] = useState<'bulk' | 'list'>('bulk');
  const [newName, setNewName] = useState('');

  if (!isOpen) return null;

  const handleBulkSave = () => {
    const rawNames = inputText
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    const updatedStudents: Student[] = rawNames.map((name, idx) => ({
      id: `s-${Date.now()}-${idx}`,
      name,
      number: idx + 1,
    }));

    onSaveStudents(updatedStudents);
    onClose();
  };

  const handleResetToDefault = () => {
    if (window.confirm('기본 학생 명단(24명)으로 초기화하시겠습니까?')) {
      onSaveStudents(INITIAL_STUDENTS);
      setInputText(INITIAL_STUDENTS.map((s) => s.name).join('\n'));
    }
  };

  const handleAddSingle = () => {
    if (!newName.trim()) return;
    const updated = [
      ...students,
      {
        id: `s-${Date.now()}`,
        name: newName.trim(),
        number: students.length + 1,
      },
    ];
    onSaveStudents(updated);
    setInputText(updated.map((s) => s.name).join('\n'));
    setNewName('');
  };

  const handleDeleteSingle = (id: string) => {
    const updated = students
      .filter((s) => s.id !== id)
      .map((s, idx) => ({ ...s, number: idx + 1 }));
    onSaveStudents(updated);
    setInputText(updated.map((s) => s.name).join('\n'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92dvh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">학생 명단 관리</h3>
              <p className="text-xs text-slate-500">현재 등록 인원: {students.length}명</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Sub-tabs */}
          <div className="flex border-b border-slate-200 space-x-3 sm:space-x-4">
            <button
              onClick={() => setActiveSubTab('bulk')}
              className={`pb-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                activeSubTab === 'bulk'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="hidden sm:inline">한 번에 입력 (줄바꿈 / 복사붙여넣기)</span>
              <span className="sm:hidden">한 번에 입력 (줄바꿈)</span>
            </button>
            <button
              onClick={() => setActiveSubTab('list')}
              className={`pb-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                activeSubTab === 'list'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              개별 목록 편집
            </button>
          </div>

          {activeSubTab === 'bulk' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                엑셀이나 나이스(NEIS), 한글에서 학생 이름을 복사하여 아래에 붙여넣으세요. (엔터 또는 쉼표 구분)
              </p>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={8}
                className="w-full text-xs sm:text-sm font-medium border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                placeholder="홍길동&#10;김철수&#10;이영희&#10;..."
              />
              <div className="text-[11px] sm:text-xs text-slate-500 flex flex-wrap justify-between gap-1">
                <span>입력 감지: {inputText.split(/[\n,]+/).filter((n) => n.trim().length > 0).length}명</span>
                <span className="text-indigo-600">※ 자리바꾸기와 청소구역에 동시 적용</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSingle()}
                  placeholder="추가할 학생 이름 입력"
                  className="flex-1 text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={handleAddSingle}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-1 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>추가</span>
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {students.map((st, idx) => (
                  <div key={st.id} className="flex items-center justify-between px-3 py-2 text-xs sm:text-sm hover:bg-slate-50">
                    <span className="text-slate-500 w-8 font-mono text-xs">{idx + 1}번</span>
                    <span className="flex-1 font-semibold text-slate-800">{st.name}</span>
                    <button
                      onClick={() => handleDeleteSingle(st.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Sticky */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={handleResetToDefault}
            className="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded-lg hover:bg-slate-200/60"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">기본 24명 초기화</span>
            <span className="sm:hidden">초기화</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-medium hover:bg-slate-100"
            >
              닫기
            </button>
            {activeSubTab === 'bulk' && (
              <button
                onClick={handleBulkSave}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>명단 저장</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
