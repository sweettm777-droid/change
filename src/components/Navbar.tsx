import React from 'react';
import { Sparkles, Users, Volume2, VolumeX, UserCheck, HelpCircle } from 'lucide-react';

interface NavbarProps {
  activeTab: 'seating' | 'cleaning';
  onTabChange: (tab: 'seating' | 'cleaning') => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenStudentManager: () => void;
  totalStudents: number;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isMuted,
  onToggleMute,
  onOpenStudentManager,
  totalStudents,
  onOpenHelp,
}) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Desktop Header (sm and up) */}
        <div className="hidden sm:flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-800 tracking-tight">학급 스마트 메이커</span>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium border border-indigo-200">
                  교실 수업용
                </span>
              </div>
              <p className="text-xs text-slate-500">
                긴장감 넘치는 자리바꾸기 & 청소구역 랜덤 배정기
              </p>
            </div>
          </div>

          {/* Center Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="tab-seating-btn"
              onClick={() => onTabChange('seating')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'seating'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>자리 바꾸기</span>
            </button>
            <button
              id="tab-cleaning-btn"
              onClick={() => onTabChange('cleaning')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'cleaning'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>청소구역 배정</span>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                자동 추첨
              </span>
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2">
            {/* Student Roster Button */}
            <button
              id="btn-student-manager"
              onClick={onOpenStudentManager}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium transition-colors"
              title="학생 명단 관리 및 수정"
            >
              <UserCheck className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline">학생 명단</span>
              <span className="bg-slate-200 text-slate-800 text-xs px-1.5 py-0.5 rounded-full font-bold">
                {totalStudents}명
              </span>
            </button>

            {/* Sound Toggle */}
            <button
              id="btn-sound-toggle"
              onClick={onToggleMute}
              className={`p-2 rounded-lg border transition-colors ${
                isMuted
                  ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
              }`}
              title={isMuted ? '음향 켜기 (긴장감 효과음)' : '음향 끄기 (음소거)'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Help Button */}
            <button
              id="btn-help-guide"
              onClick={onOpenHelp}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="사용 가이드"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Header (<sm) */}
        <div className="sm:hidden py-2.5 space-y-2">
          {/* Top row: Brand & Action icons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-xs shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="font-extrabold text-base text-slate-900 tracking-tight block truncate">
                  학급 스마트 메이커
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              {/* Student Roster Button */}
              <button
                onClick={onOpenStudentManager}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold"
                title="학생 명단 관리"
              >
                <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                <span>{totalStudents}명</span>
              </button>

              {/* Sound Toggle */}
              <button
                onClick={onToggleMute}
                className={`p-1.5 rounded-lg border ${
                  isMuted
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                }`}
                title={isMuted ? '음향 켜기' : '음소거'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Help Button */}
              <button
                onClick={onOpenHelp}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                title="사용 가이드"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom row: Full-width segmented tab switcher */}
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onTabChange('seating')}
              className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'seating'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>자리 바꾸기</span>
            </button>
            <button
              onClick={() => onTabChange('cleaning')}
              className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'cleaning'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>청소구역 배정</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
