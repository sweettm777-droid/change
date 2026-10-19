import React, { useState } from 'react';
import {
  X,
  Lock,
  Unlock,
  ShieldCheck,
  UserX,
  MapPin,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { DeskCell, Student, TeacherConstraints } from '../../types';

interface TeacherSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  desks: DeskCell[];
  constraints: TeacherConstraints;
  onSaveConstraints: (constraints: TeacherConstraints) => void;
}

export const TeacherSettingsModal: React.FC<TeacherSettingsModalProps> = ({
  isOpen,
  onClose,
  students,
  desks,
  constraints,
  onSaveConstraints,
}) => {
  // Local state initialized with current constraints
  const [localConstraints, setLocalConstraints] = useState<TeacherConstraints>(() => ({
    ...constraints,
    separationPairs: [...constraints.separationPairs],
    fixedAssignments: [...constraints.fixedAssignments],
  }));

  // PIN authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => !constraints.isPinRequired);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Separation inputs
  const [sepStudent1, setSepStudent1] = useState('');
  const [sepStudent2, setSepStudent2] = useState('');

  // Fixed seat inputs
  const [fixedStudent, setFixedStudent] = useState('');
  const [fixedRow, setFixedRow] = useState<number>(0);
  const [fixedCol, setFixedCol] = useState<number>(0);

  if (!isOpen) return null;

  // PIN verification
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === localConstraints.pin || enteredPin === '0000') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // Add separation pair
  const handleAddSeparation = () => {
    if (!sepStudent1 || !sepStudent2 || sepStudent1 === sepStudent2) {
      alert('서로 다른 두 명의 학생을 선택해주세요.');
      return;
    }

    // Check duplicate
    const exists = localConstraints.separationPairs.some(
      ([a, b]) =>
        (a === sepStudent1 && b === sepStudent2) || (a === sepStudent2 && b === sepStudent1)
    );
    if (exists) {
      alert('이미 등록된 분리 조건입니다.');
      return;
    }

    setLocalConstraints((prev) => ({
      ...prev,
      separationPairs: [...prev.separationPairs, [sepStudent1, sepStudent2]],
    }));
    setSepStudent1('');
    setSepStudent2('');
  };

  // Remove separation pair
  const handleRemoveSeparation = (index: number) => {
    setLocalConstraints((prev) => ({
      ...prev,
      separationPairs: prev.separationPairs.filter((_, i) => i !== index),
    }));
  };

  // Add fixed seat
  const handleAddFixed = () => {
    if (!fixedStudent) {
      alert('지정석에 배치할 학생을 선택해주세요.');
      return;
    }

    // Check if target desk is active
    const targetDesk = desks.find((d) => d.row === fixedRow && d.col === fixedCol);
    if (!targetDesk || !targetDesk.isActive) {
      alert('선택한 위치는 비활성화된 좌석(통로/빈자리)입니다. 다른 좌석을 골라주세요.');
      return;
    }

    // Check if desk already assigned
    const deskTaken = localConstraints.fixedAssignments.some(
      (fa) => fa.row === fixedRow && fa.col === fixedCol
    );
    if (deskTaken) {
      alert('해당 좌석은 이미 다른 학생이 지정석으로 등록되어 있습니다.');
      return;
    }

    // Check if student already fixed
    const studentFixed = localConstraints.fixedAssignments.some(
      (fa) => fa.studentId === fixedStudent
    );
    if (studentFixed) {
      alert('이 학생은 이미 다른 위치에 지정석으로 등록되어 있습니다.');
      return;
    }

    setLocalConstraints((prev) => ({
      ...prev,
      fixedAssignments: [
        ...prev.fixedAssignments,
        { studentId: fixedStudent, row: fixedRow, col: fixedCol },
      ],
    }));
    setFixedStudent('');
  };

  // Remove fixed assignment
  const handleRemoveFixed = (index: number) => {
    setLocalConstraints((prev) => ({
      ...prev,
      fixedAssignments: prev.fixedAssignments.filter((_, i) => i !== index),
    }));
  };

  const handleSaveAndClose = () => {
    onSaveConstraints(localConstraints);
    onClose();
  };

  const activeDesks = desks.filter((d) => d.isActive);
  const rowsCount = Math.max(...desks.map((d) => d.row), 0) + 1;
  const colsCount = Math.max(...desks.map((d) => d.col), 0) + 1;

  // Helper to get student name
  const getStudentName = (id: string) => {
    const s = students.find((st) => st.id === id || st.name === id);
    return s ? s.name : id;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92dvh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm sm:text-base tracking-tight">교사 전용 비밀 설정</h3>
                <span className="text-[10px] sm:text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-medium">
                  비공개 보관
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                학생 화면에는 노출되지 않으며, 교사의 특별 배정 규칙을 비밀리에 처리합니다.
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

        {/* PIN Security Check Screen */}
        {!isAuthenticated ? (
          <div className="p-8 text-center max-w-sm mx-auto space-y-4">
            <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-lg">교사 비밀번호 입력</h4>
              <p className="text-xs text-slate-500 mt-1">
                화면 공유 중 학생에게 비밀 규칙이 보이지 않도록 잠겨 있습니다. (초기 비밀번호: 0000)
              </p>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-3">
              <input
                type="password"
                maxLength={8}
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError(false);
                }}
                placeholder="비밀번호 4자리 (0000)"
                className={`w-full text-center text-lg tracking-widest font-mono py-2.5 px-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                  pinError ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                }`}
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-rose-500 font-medium">비밀번호가 일치하지 않습니다. (기본: 0000)</p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs"
              >
                비밀 설정 열기
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Settings Screen */
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
            {/* Info notice */}
            <div className="flex items-start space-x-2.5 bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">안내:</span> 여기에 등록된 특별 요청사항은 자리 배치 시 최우선으로 반영되며,
                전체 화면 공개 애니메이션에서도 특별 규칙이 있었음을 알리지 않고 자연스럽게 섞인 것처럼 연출됩니다.
              </div>
            </div>

            {/* SECTION 1: SEPARATION PAIRS (꼭 떼어놔야 하는 둘) */}
            <div className="space-y-3 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserX className="w-4 h-4 text-rose-600" />
                  <h4 className="font-bold text-slate-800 text-sm">
                    1. 꼭 떼어놔야 하는 둘 (분리 조건)
                  </h4>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  현재 {localConstraints.separationPairs.length}건 등록
                </span>
              </div>
              <p className="text-xs text-slate-500">
                수업 방해, 잦은 다툼 등으로 인해 짝꿍 및 바로 인접한 자리에 앉히지 말아야 할 두 학생을 지정합니다.
              </p>

              {/* Add form */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="sm:col-span-2">
                  <select
                    value={sepStudent1}
                    onChange={(e) => setSepStudent1(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">학생 1 선택</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.number ? `${s.number}번 ` : ''}{s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-center text-xs font-bold text-slate-400">⚡ 떼어놓기 ⚡</div>
                <div className="sm:col-span-2 flex space-x-2">
                  <select
                    value={sepStudent2}
                    onChange={(e) => setSepStudent2(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">학생 2 선택</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id} disabled={s.id === sepStudent1}>
                        {s.number ? `${s.number}번 ` : ''}{s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddSeparation}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
                  >
                    추가
                  </button>
                </div>
              </div>

              {/* List of separation pairs */}
              {localConstraints.separationPairs.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {localConstraints.separationPairs.map(([id1, id2], idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white border border-rose-200/80 rounded-lg px-3 py-2 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {getStudentName(id1)}
                        </span>
                        <span className="text-rose-500 font-mono font-bold">⇹ 서로 떨어뜨림 ⇹</span>
                        <span className="font-semibold text-slate-800">
                          {getStudentName(id2)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveSeparation(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="조건 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-1">등록된 분리 조건이 없습니다.</p>
              )}
            </div>

            {/* SECTION 2: FIXED SEATS (특별히 누구는 어디에 위치해야 한다) */}
            <div className="space-y-3 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-slate-800 text-sm">
                    2. 특정 학생 지정석 배치 (고정 위치)
                  </h4>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  현재 {localConstraints.fixedAssignments.length}건 등록
                </span>
              </div>
              <p className="text-xs text-slate-500">
                시력 저하, 체구, 휠체어, 다리 깁스, 교사 밀착 관심 등이 필요한 학생을 특정 줄/열에 고정 배치합니다.
              </p>

              {/* Add form */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="sm:col-span-2">
                  <select
                    value={fixedStudent}
                    onChange={(e) => setFixedStudent(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">고정할 학생 선택</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.number ? `${s.number}번 ` : ''}{s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={`${fixedRow}-${fixedCol}`}
                    onChange={(e) => {
                      const [r, c] = e.target.value.split('-').map(Number);
                      setFixedRow(r);
                      setFixedCol(c);
                    }}
                    className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                  >
                    {activeDesks.map((d) => (
                      <option key={d.id} value={`${d.row}-${d.col}`}>
                        {d.row + 1}줄(행) {d.col + 1}번째 열
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <button
                    onClick={handleAddFixed}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    지정석 등록
                  </button>
                </div>
              </div>

              {/* List of fixed seats */}
              {localConstraints.fixedAssignments.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {localConstraints.fixedAssignments.map((fa, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white border border-indigo-200/80 rounded-lg px-3 py-2 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {getStudentName(fa.studentId)}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {fa.row + 1}번째 줄(앞에서부터) · {fa.col + 1}번째 열
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveFixed(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="지정석 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-1">등록된 지정석이 없습니다.</p>
              )}
            </div>

            {/* SECTION 3: PIN SECURITY TOGGLE */}
            <div className="flex items-center justify-between p-4 bg-slate-100 rounded-xl border border-slate-200">
              <div>
                <div className="font-bold text-xs text-slate-800">비밀번호 잠금 활성화</div>
                <div className="text-[11px] text-slate-500">
                  학생들과 화면을 공유할 때 이 메뉴를 클릭하면 비밀번호를 묻도록 보호합니다.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConstraints.isPinRequired}
                  onChange={(e) =>
                    setLocalConstraints((prev) => ({
                      ...prev,
                      isPinRequired: e.target.checked,
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] sm:text-xs text-slate-500">
            {isAuthenticated ? '설정이 저장되면 즉시 다음 자리배치에 반영됩니다.' : ''}
          </div>
          <div className="flex space-x-2 ml-auto">
            <button
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-medium hover:bg-slate-100"
            >
              닫기
            </button>
            {isAuthenticated && (
              <button
                onClick={handleSaveAndClose}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>비밀 조건 저장</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
