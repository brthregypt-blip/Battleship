import React from 'react';
import { GameStats, Language } from '../types';
import { DoodleStar, DoodleSkull, TargetDoodle } from './HandDrawnIcons';
import { RotateCcw, Award } from 'lucide-react';

interface GameOverModalProps {
  winner: 'player' | 'computer';
  stats: GameStats;
  onRestart: () => void;
  lang?: Language;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  stats,
  onRestart,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';
  const isVictory = winner === 'player';
  const playerAccuracy =
    stats.playerShots > 0
      ? Math.round((stats.playerHits / stats.playerShots) * 100)
      : 0;
  const computerAccuracy =
    stats.computerShots > 0
      ? Math.round((stats.computerHits / stats.computerShots) * 100)
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a3a5f]/40 backdrop-blur-xs animate-in fade-in duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div
        className="relative w-full max-w-md bg-[#fdfaf5] p-6 sm:p-8 rounded-lg border-2 border-[#1a3a5f] artistic-box-shadow font-clean text-[#1a3a5f]"
        style={{
          borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
        }}
      >
        {/* Top Tape */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-amber-100/90 border border-amber-300/90 shadow-xs"></div>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            {isVictory ? (
              <div className="p-3 bg-amber-50 rounded-full border-2 border-[#ca8a04] sketch-border animate-bounce">
                <DoodleStar size={44} />
              </div>
            ) : (
              <div className="p-3 bg-red-50 rounded-full border-2 border-[#cc3333] sketch-border animate-pulse">
                <DoodleSkull size={44} />
              </div>
            )}
          </div>

          <h2
            className={`text-3xl sm:text-4xl font-extrabold font-cairo tracking-wide mb-1 ${
              isVictory ? 'text-[#1a3a5f]' : 'text-[#cc3333]'
            }`}
          >
            {isVictory
              ? isAr
                ? '🏆 نصر بحري مؤزر!'
                : 'VICTORY AT SEA!'
              : isAr
              ? '💥 دُمر الأسطول بالكامل!'
              : 'FLEET DESTROYED!'}
          </h2>

          <p className="text-sm sm:text-base text-[#1a3a5f] opacity-85 font-clean mt-2">
            {isVictory
              ? isAr
                ? 'تهانينا أيها القائد! نجحت في إغراق جميع سفن أسطول العدو.'
                : 'You successfully sank the entire enemy armada!'
              : isAr
              ? 'تمكن الكمبيوتر التكتيكي من اصطياد وإغراق جميع سفنك.'
              : 'The enemy tactical computer sank all your battleships.'}
          </p>
        </div>

        {/* Scorecard */}
        <div className="bg-white/80 border-2 border-[#1a3a5f] rounded-md p-4 mb-6 artistic-box-shadow-sm space-y-2.5">
          <div className="flex items-center justify-between border-b-2 border-[#1a3a5f] border-dashed pb-2 font-bold text-sm text-[#1a3a5f]">
            <span className="font-cairo">
              {isAr ? 'إحصائيات المعركة' : 'Battle Statistics'}
            </span>
            <span className="font-clean text-xs text-[#1a3a5f] opacity-80">
              {isAr ? `إجمالي الضربات: ${stats.turns}` : `Total Salvos: ${stats.turns}`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2.5 bg-[#d1e4f0]/30 rounded border border-[#1a3a5f]/40">
              <p className="font-bold text-[#1a3a5f] font-cairo flex items-center gap-1">
                <TargetDoodle size={16} /> {isAr ? 'دقة إصاباتك' : 'Your Accuracy'}
              </p>
              <p className="text-2xl font-bold font-display text-[#1a3a5f] mt-0.5">
                {playerAccuracy}%
              </p>
              <p className="text-xs text-[#1a3a5f] opacity-75 font-clean">
                {stats.playerHits} {isAr ? 'إصابة' : 'hits'} / {stats.playerShots}{' '}
                {isAr ? 'طلقة' : 'shots'}
              </p>
            </div>

            <div className="p-2.5 bg-red-50/80 rounded border border-[#cc3333]/40">
              <p className="font-bold text-[#cc3333] font-cairo flex items-center gap-1">
                <Award size={16} /> {isAr ? 'دقة العدو' : 'Enemy Accuracy'}
              </p>
              <p className="text-2xl font-bold font-display text-[#cc3333] mt-0.5">
                {computerAccuracy}%
              </p>
              <p className="text-xs text-[#cc3333] opacity-80 font-clean">
                {stats.computerHits} {isAr ? 'إصابة' : 'hits'} / {stats.computerShots}{' '}
                {isAr ? 'طلقة' : 'shots'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-[#1a3a5f] text-white hover:bg-[#0f233a] border-2 border-[#1a3a5f] artistic-box-shadow font-cairo font-bold text-base sm:text-lg transition-all active:translate-y-0.5 cursor-pointer"
            style={{
              borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
            }}
          >
            <RotateCcw size={20} />
            <span>{isAr ? 'معركة جديدة (ورقة جديدة)' : 'PLAY AGAIN (NEW SHEET)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
