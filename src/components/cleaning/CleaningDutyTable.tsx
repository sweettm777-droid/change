import React from 'react';
import { CleaningArea } from '../../types';
import { Edit3, PlusCircle } from 'lucide-react';

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
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 sm:p-10 border border-slate-300 shadow-sm rounded-xl printable-area">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-wider">
          {classNameTitle ? `${classNameTitle} 청소 구역표` : '학급 청소 구역표'}
        </h1>
        <div className="w-48 h-0.5 bg-slate-900 mx-auto mt-2"></div>

        {onOpenSettings && (
          <div className="no-print mt-3 flex justify-center">
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-emerald-700 font-bold bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
              title="청소구역 항목 및 인원수 자유롭게 편집하기"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>청소구역 항목 자유 편집하기</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      {areas.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 space-y-3">
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
        <div className="overflow-x-auto border-2 border-slate-900">
          <table className="w-full border-collapse text-center text-sm sm:text-base">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-50 font-bold text-slate-900">
                <th className="py-2.5 px-3 border-r border-slate-400 w-1/4">담당</th>
                <th className="py-2.5 px-3 border-r border-slate-400 w-1/2">내용</th>
                <th className="py-2.5 px-3 w-1/4">담당자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-400">
              {areas.map((area) => {
                const subCount = area.subItems.length;

                return area.subItems.map((sub, subIdx) => {
                  // Fixed students are shaded (음영 처리)
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
                          className="py-3 px-3 font-bold text-slate-900 align-middle whitespace-pre-line bg-slate-50/40 text-center"
                        >
                          {area.category}
                        </td>
                      )}

                      {/* Duty Description Content */}
                      <td className="py-3 px-4 text-slate-800 align-middle text-center whitespace-pre-line leading-relaxed text-sm">
                        {sub.title}
                      </td>

                      {/* Assignee / Students Column */}
                      <td className="p-0 align-middle">
                        <div className="flex flex-col h-full min-h-[44px] justify-center divide-y divide-slate-300">
                          {/* 1. Shaded (Fixed) Students - PDF 음영 칸 완벽 재현 */}
                          {fixedList.length > 0 && (
                            <div className="bg-slate-300/80 font-bold text-slate-900 py-2 px-2 text-center text-sm sm:text-base">
                              {fixedList.join(', ')}
                            </div>
                          )}

                          {/* 2. Remaining Randomly Assigned Students or Placeholder Count */}
                          {isRevealed ? (
                            randomAssigned.length > 0 ? (
                              <div className="py-2 px-2 font-bold text-indigo-900 text-sm sm:text-base bg-indigo-50/30">
                                {randomAssigned.join(', ')}
                              </div>
                            ) : fixedList.length === 0 ? (
                              <div className="py-2 px-2 text-slate-400 italic text-xs">
                                (미배정)
                              </div>
                            ) : null
                          ) : (
                            // Unrevealed initial state: Shows required count as seen in the PDF ("1명", "2명", "4명")
                            sub.count - fixedList.length > 0 && (
                              <div className="py-2 px-2 text-slate-700 font-medium text-sm">
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
      )}

      {/* Footer Notes */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>※ 무작위 자동 추첨으로 배정되었으며, 음영 처리된 칸은 고정 담당자입니다.</span>
        <span className="print-only font-mono">인쇄일자: {new Date().toLocaleDateString('ko-KR')}</span>
      </div>
    </div>
  );
};
