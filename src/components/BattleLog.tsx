import React from 'react';
import { LogEntry, Language } from '../types';
import { Target, ShieldAlert, Zap } from 'lucide-react';
import { PlaneDoodle, TorpedoDoodle } from './HandDrawnIcons';

interface BattleLogProps {
  logs: LogEntry[];
  lang?: Language;
}

export const BattleLog: React.FC<BattleLogProps> = ({ logs, lang = 'ar' }) => {
  const isAr = lang === 'ar';

  return (
    <div
      className="bg-[#fdfaf5]/90 border-2 border-[#1a3a5f] p-3 sm:p-4 artistic-box-shadow flex flex-col h-full max-h-[340px]"
      style={{
        borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
      }}
    >
      <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b-2 border-[#1a3a5f] border-dashed">
        <h4 className="text-base sm:text-lg font-bold text-[#1a3a5f] font-cairo flex items-center gap-1.5">
          <span>{isAr ? 'سجل المعركة والعمليات' : "Captain's Battle Log"}</span>
          <span className="text-xs text-[#1a3a5f] opacity-80 font-clean font-normal">
            ({logs.length} {isAr ? 'ضربة' : 'moves'})
          </span>
        </h4>
        <span className="text-[11px] text-[#1a3a5f] opacity-75 font-clean">
          {isAr ? 'تحديث لحظي' : 'Live updates'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 sketch-scrollbar pr-1">
        {logs.length === 0 ? (
          <div className="py-8 text-center text-[#1a3a5f] opacity-60 font-clean text-sm italic">
            {isAr
              ? 'لم يتم إطلاق أي صاروخ بعد... وجّه مدافعك نحو رادار العدو!'
              : 'No shots fired yet... Order fire on the radar!'}
          </div>
        ) : (
          logs.map(log => {
            const isPlayer = log.attacker === 'player';
            const isHit = log.result === 'hit';
            const isSunk = log.result === 'sunk';
            const shipDisplayName = isAr ? log.shipNameAr || log.shipName : log.shipName;

            return (
              <div
                key={log.id}
                className={`text-xs sm:text-sm p-2 rounded flex items-center justify-between font-clean transition-colors border ${
                  isSunk
                    ? 'bg-red-100/90 border-[#cc3333] text-[#cc3333] font-bold'
                    : isHit
                    ? 'bg-amber-50/90 border-[#cc3333]/60 text-[#cc3333]'
                    : 'bg-white/80 border-[#1a3a5f]/30 text-[#1a3a5f]'
                }`}
                style={{
                  borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
                }}
              >
                <div className="flex items-center gap-1.5">
                  {log.weapon === 'airstrike' ? (
                    <PlaneDoodle size={14} className="text-amber-700 shrink-0" />
                  ) : log.weapon === 'torpedo' ? (
                    <TorpedoDoodle size={14} className="text-cyan-700 shrink-0" />
                  ) : isPlayer ? (
                    <Target size={14} className="text-[#1a3a5f] shrink-0" />
                  ) : (
                    <ShieldAlert size={14} className="text-[#cc3333] shrink-0" />
                  )}
                  <span>
                    <strong className="font-cairo">
                      {isPlayer ? (isAr ? 'أنت' : 'YOU') : (isAr ? 'العدو' : 'ENEMY')}:
                    </strong>{' '}
                    {isAr ? 'إطلاق على الإحداثي' : 'Shot at'}{' '}
                    <span className="underline font-bold font-display">{log.coordinate}</span>
                  </span>
                </div>

                <div className="font-bold font-cairo text-xs shrink-0 ml-2">
                  {isSunk ? (
                    <span className="text-[#cc3333] bg-red-100 px-1.5 py-0.5 rounded border border-[#cc3333]">
                      {isAr ? `إغراق ${shipDisplayName}!` : `SUNK ${shipDisplayName}!`}
                    </span>
                  ) : isHit ? (
                    <span className="text-[#cc3333] bg-amber-100 px-1.5 py-0.5 rounded border border-[#cc3333]">
                      {isAr ? 'إصابة مباشرة!' : 'HIT!'}
                    </span>
                  ) : (
                    <span className="text-[#1a3a5f] opacity-60">
                      {isAr ? 'في الماء' : 'MISS'}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
