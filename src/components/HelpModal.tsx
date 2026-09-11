import React from 'react';
import { X, HelpCircle, Users, Sparkles, Lock, Printer, Download } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in duration-150">
        <div className="px-6 py-4 bg-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <HelpCircle className="w-5 h-5 text-indigo-300" />
            <h3 className="font-bold text-base">학급 스마트 메이커 사용 가이드</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-[70vh] overflow-y-auto">
          {/* Section 1 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center space-x-1.5 text-sm">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>1. 긴장감 넘치는 자리바꾸기</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
              <li>
                <b>배치 형태 지원</b>: 짝꿍 분단형(2인 1조), 시험 대형(1인 1석), 하이브리드형(짝꿍+1인석), 자유 편집(책상 유무 토글)을 지원합니다.
              </li>
              <li>
                <b>화면 공유 연출</b>: [자리 섞기 & 공개 시작]을 누르면 모든 좌석이 신비한 물음표 카드로 전환되며, 하나씩 발표하거나 자동 롤링 발표로 두근두근한 긴장감을 연출합니다.
              </li>
              <li>
                <b>효과음</b>: 심장박동, 드럼롤, 카드 뒤집기 핑, 완성 팡파레가 내장되어 있으며 상단 스피커 아이콘으로 즉시 음소거할 수 있습니다.
              </li>
              <li>
                <b>시점 전환</b>: 칠판을 바라보는 학생 시점과 교탁에서 내려다보는 선생님 시점을 자유롭게 전환할 수 있습니다.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center space-x-1.5 text-sm">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>2. 교사 전용 비밀 설정 (비밀번호 보호)</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
              <li>
                학생과 화면을 공유하는 동안 민감한 정보가 노출되지 않도록 별도의 비밀 메뉴 안에 배치되었습니다.
              </li>
              <li>
                <b>꼭 떼어놔야 하는 둘</b>: 좌우 짝꿍이나 인접한 위치에 앉히지 않도록 자동 분리 알고리즘이 적용됩니다.
              </li>
              <li>
                <b>지정석</b>: 시력, 건강, 관심 지도가 필요한 학생을 원하는 행/열에 비밀리에 고정합니다.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center space-x-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>3. 청소구역표 탑재 & 전 구역 랜덤 배정</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
              <li>
                교실 쓸기/닦기, 칠판 정리, 손걸레, 복도, 분리수거, 특별구역 등 실무 청소 항목이 기본 탑재되어 있으며 모든 구역이 무작위로 공정하게 자동 추첨됩니다.
              </li>
              <li>
                <b>특별 설정 지원</b>: 필요시 [청소구역 특별 설정]에서 원하는 학생을 특정 구역에 음영 고정하거나, 구역 추가/삭제, 인원수 조절, 청소 제외 학생(임원 등)을 지정할 수 있습니다.
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center space-x-1.5 text-sm">
              <Printer className="w-4 h-4 text-blue-600" />
              <span>4. 인쇄 및 JPG 다운로드</span>
            </h4>
            <p className="text-slate-600">
              배치 결과를 클릭 한 번으로 고화질 JPG 이미지로 다운로드하거나 A4 규격에 맞춰 예쁘게 인쇄할 수 있으며, 클립보드 복사로 한글(HWP)이나 파워포인트 문서에 바로 붙여넣을 수 있습니다.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
