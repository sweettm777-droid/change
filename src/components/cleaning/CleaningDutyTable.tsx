import React, { useState } from 'react';
import { CleaningArea } from '../../types';
import { Edit3, PlusCircle, LayoutList, Table as TableIcon, Sparkles } from 'lucide-react';

interface CleaningDutyTableProps {
  classNameTitle: string;
  areas: CleaningArea[];
  isRevealed: boolean;
  onOpenSettings?: () => void;
}

export const CleaningDutyTable: React.FC<CleaningDutyTableProps> = ({
  classNameTitle,
  areas,
  isRevealed,
  onOpenSettings,
}) => {
  // Mobile display mode toggle: 'table' vs 'card'
  const [mobileDisplayMode, setMobileDisplayMode] = useState<'table' | 'card'>('table');

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-3.5 sm:p-10 border border-slate-300 shadow-sm rounded-xl printable-area">
      {/* Title */}
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-wider">
          {classNameTitle ? `${classNameTitle} 청소 구역표` : '학급 청소 구역표'}
        </h1>
        <div className="w-36 sm:w-48 h-0.5 bg-slate-900 mx-auto mt-2"></div>

        {/* Action & Mobile View Toggle Bar (no-print) */}
        <div className="no-print mt-3 flex flex-wrap items-center justify-center gap-2">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-emerald-700 font-bold bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
              title="청소구역 항목 및 인원수 자유롭게 편집하기"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>청소구역 항목 자유 편집하기</span>
            </button>
          )}

          {/* Mobile view switch (visible on screens under 768px) */}
          <div className="flex md:hidden items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setMobileDisplayMode('table')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                mobileDisplayMode === 'table'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              <TableIcon className="w-3 h-3" />
              <span>표 형식</span>
            </button>
            <button
              onClick={() => setMobileDisplayMode('card')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold transition-all ${
                mobileDisplayMode === 'card'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              <LayoutList className="w-3 h-3" />
              <span>카드형</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {areas.length === 0 ? (
        <div className="py-10 sm:py-12 text-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 space-y-3">
          <p className="text-sm font-semibold text-slate-600">등록된 청소구역이 없습니다.</p>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>청소구역 설정하고 시작하기</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* 1. Mobile Card View (visible on mobile only when card mode is active, hidden on print) */}
          {mobileDisplayMode === 'card' && (
            <div className="no-print md:hidden space-y-3 mb-4">
              {areas.map((area) => (
                <div
                  key={area.id}
                  className="bg-white border-2 border-slate-800 rounded-xl overflow-hidden shadow-xs"
                >
                  {/* Category Header */}
                  <div className="bg-slate-100 px-3.5 py-2 border-b-2 border-slate-800 font-extrabold text-sm text-slate-900 flex items-center justify-between">
                    <span>{area.category}</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      {area.subItems.reduce((sum, s) => sum + s.count, 0)}명
                    </span>
                  </div>

                  {/* Sub-items */}
                  <div className="divide-y divide-slate-200">
                    {area.subItems.map((sub) => {
                      const fixedList = sub.fixedStudents;
                      const assignedList = sub.assignedStudents || [];
                      const randomAssigned = assignedList.filter(
                        (name) => !fixedList.includes(name)
                      );

                      return (
                        <div key={sub.id} className="p-3 space-y-1.5">
                          <div className="text-xs font-semibold text-slate-800">
                            {sub.title}
                          </div>

                          {/* Assignees */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {/* Fixed students */}
                            {fixedList.map((name, i) => (
                              <span
                                key={i}
                                className="bg-slate-300 text-slate-900 px-2 py-0.5 rounded text-xs font-bold border border-slate-400"
                                title="고정 배정자"
                              >
                                {name} (고정)
                              </span>
                            ))}

                            {/* Randomly assigned or unrevealed count */}
                            {isRevealed ? (
                              randomAssigned.length > 0 ? (
                                randomAssigned.map((name, i) => (
                                  <span
                                    key={i}
                                    className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-xs font-bold border border-emerald-300 animate-in fade-in"
                                  >
                                    {name}
                                  </span>
                                ))
                              ) : fixedList.length === 0 ? (
                                <span className="text-xs text-slate-400 italic">미배정</span>
                              ) : null
                            ) : (
                              sub.count - fixedList.length > 0 && (
                                <span className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                                  {sub.count - fixedList.length}명 배정 예정
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. Official Standard Table (Always shown on desktop, print, or when table mode is selected) */}
          <div
            className={`border-2 border-slate-900 ${
              mobileDisplayMode === 'card' ? 'hidden md:block print:block' : 'block'
            }`}
          >
            <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <table className="w-full border-collapse text-center text-xs sm:text-base min-w-[340px]">
                <thead>
                  <tr className="border-b-2 border-slate-900 bg-slate-50 font-bold text-slate-900">
                    <th className="py-2 sm:py-2.5 px-2 sm:px-3 border-r border-slate-400 w-1/4">담당</th>
                    <th className="py-2 sm:py-2.5 px-2 sm:px-3 border-r border-slate-400 w-1/2">내용</th>
                    <th className="py-2 sm:py-2.5 px-2 sm:px-3 w-1/4">담당자</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-400">
                  {areas.map((area) => {
                    const subCount = area.subItems.length;

                    return area.subItems.map((sub, subIdx) => {
                      const fixedList = sub.fixedStudents;
                      const assignedList = sub.assignedStudents || [];
                      const randomAssigned = assignedList.filter(
                        (name) => !fixedList.includes(name)
                      );

                      return (
                        <tr key={sub.id} className="divide-x divide-slate-400">
                          {/* Category Column with RowSpan */}
                          {subIdx === 0 && (
                            <td
                              rowSpan={subCount}
                              className="py-2.5 sm:py-3 px-2 sm:px-3 font-bold text-slate-900 align-middle whitespace-pre-line bg-slate-50/40 text-center"
                            >
                              {area.category}
                            </td>
                          )}

                          {/* Duty Description Content */}
                          <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-slate-800 align-middle text-center whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                            {sub.title}
                          </td>

                          {/* Assignee / Students Column */}
                          <td className="p-0 align-middle">
                            <div className="flex flex-col h-full min-h-[40px] sm:min-h-[44px] justify-center divide-y divide-slate-300">
                              {/* 1. Shaded (Fixed) Students */}
                              {fixedList.length > 0 && (
                                <div className="bg-slate-300/80 font-bold text-slate-900 py-1.5 sm:py-2 px-1.5 sm:px-2 text-center text-xs sm:text-base">
                                  {fixedList.join(', ')}
                                </div>
                              )}

                              {/* 2. Remaining Randomly Assigned Students or Placeholder Count */}
                              {isRevealed ? (
                                randomAssigned.length > 0 ? (
                                  <div className="py-1.5 sm:py-2 px-1.5 sm:px-2 font-bold text-indigo-900 text-xs sm:text-base bg-indigo-50/30">
                                    {randomAssigned.join(', ')}
                                  </div>
                                ) : fixedList.length === 0 ? (
                                  <div className="py-1.5 sm:py-2 px-1.5 sm:px-2 text-slate-400 italic text-[11px] sm:text-xs">
                                    (미배정)
                                  </div>
                                ) : null
                              ) : (
                                sub.count - fixedList.length > 0 && (
                                  <div className="py-1.5 sm:py-2 px-1.5 sm:px-2 text-slate-700 font-medium text-xs sm:text-sm">
                                    {sub.count - fixedList.length}명
                                  </div>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Footer Notes */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-slate-500 gap-1 text-center sm:text-left">
        <span>※ 무작위 자동 추첨으로 배정되었으며, 음영 처리된 칸은 고정 담당자입니다.</span>
        <span className="print-only font-mono">인쇄일자: {new Date().toLocaleDateString('ko-KR')}</span>
      </div>
    </div>
  );
};
