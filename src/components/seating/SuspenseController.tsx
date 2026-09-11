import React, { useEffect, useState, useRef } from 'react';
import {
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Sparkles,
  Volume2,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../../utils/audio';

interface SuspenseControllerProps {
  isRevealing: boolean;
  totalSeats: number;
  revealedCount: number;
  onRevealNext: () => void;
  onRevealAll: () => void;
  onResetReveal: () => void;
  onAutoRevealToggle: (active: boolean) => void;
  isAutoRevealing: boolean;
}

export const SuspenseController: React.FC<SuspenseControllerProps> = ({
  isRevealing,
  totalSeats,
  revealedCount,
  onRevealNext,
  onRevealAll,
  onResetReveal,
  onAutoRevealToggle,
  isAutoRevealing,
}) => {
  const [speed, setSpeed] = useState<number>(1000); // 1.0s interval
  const timerRef = useRef<number | null>(null);

  const isCompleted = revealedCount >= totalSeats && totalSeats > 0;

  // Trigger celebration on completion
  useEffect(() => {
    if (isCompleted && isRevealing) {
      soundEffects.playFanfare();
      // Throw confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch {
        // confetti catch
      }
    }
  }, [isCompleted, isRevealing]);

  // Handle auto reveal timer
  useEffect(() => {
    if (isAutoRevealing && !isCompleted) {
      timerRef.current = window.setInterval(() => {
        soundEffects.playHeartbeat();
        onRevealNext();
      }, speed);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoRevealing, isCompleted, speed, onRevealNext]);

  const handleNextClick = () => {
    soundEffects.playDrumRollTick(1.2);
    onRevealNext();
  };

  const progressPercent = totalSeats > 0 ? Math.round((revealedCount / totalSeats) * 100) : 0;

  return (
    <div className="no-print bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xl border border-indigo-800/40">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Status & Progress */}
        <div className="flex-1 w-full md:w-auto">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isCompleted ? 'bg-emerald-400' : 'bg-amber-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                }`}></span>
              </span>
              <span className="font-bold text-sm tracking-tight">
                {isCompleted
                  ? '🎉 전체 자리 공개 완료!'
                  : isAutoRevealing
                  ? '⚡ 두근두근 자동 롤링 발표 중...'
                  : '👀 자리 공개 준비 완료'}
              </span>
            </div>
            <span className="text-xs font-mono font-semibold text-indigo-200">
              {revealedCount} / {totalSeats}석 ({progressPercent}%)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-indigo-400 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {!isCompleted ? (
            <>
              {/* Step by step next button */}
              <button
                id="btn-reveal-next"
                onClick={handleNextClick}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all active:scale-95 animate-suspense-pulse"
              >
                <span>다음 자리 발표</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Auto play toggle */}
              <button
                id="btn-auto-reveal"
                onClick={() => onAutoRevealToggle(!isAutoRevealing)}
                className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  isAutoRevealing
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300 hover:bg-rose-500/30'
                    : 'bg-indigo-600/30 border-indigo-500 text-indigo-200 hover:bg-indigo-600/40'
                }`}
              >
                {isAutoRevealing ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>일시정지</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>자동 공개</span>
                  </>
                )}
              </button>

              {/* Reveal All (Skip) */}
              <button
                id="btn-reveal-all"
                onClick={onRevealAll}
                className="flex items-center space-x-1 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                title="한 번에 전체 공개"
              >
                <FastForward className="w-4 h-4" />
                <span>즉시 전체 공개</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>모든 좌석 발표 완료!</span>
              </span>
              <button
                onClick={onResetReveal}
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>다시 숨기기</span>
              </button>
            </div>
          )}

          {/* Speed selector if auto revealing */}
          {isAutoRevealing && (
            <div className="flex items-center space-x-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-400 text-[11px]">속도:</span>
              <button
                onClick={() => setSpeed(1400)}
                className={`px-1.5 py-0.5 rounded ${speed === 1400 ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                느리게
              </button>
              <button
                onClick={() => setSpeed(900)}
                className={`px-1.5 py-0.5 rounded ${speed === 900 ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                보통
              </button>
              <button
                onClick={() => setSpeed(500)}
                className={`px-1.5 py-0.5 rounded ${speed === 500 ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                빠르게
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
