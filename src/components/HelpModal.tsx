import React from 'react';
import { X, HelpCircle, Anchor, Crosshair, Sparkles, Volume2 } from 'lucide-react';
import { Language } from '../types';
import {
  PenHitCross,
  PenMissDot,
  PlaneDoodle,
  TorpedoDoodle,
  RocketDoodle,
} from './HandDrawnIcons';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  lang = 'ar',
}) => {
  if (!isOpen) return null;
  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a3a5f]/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-[#fdfaf5] p-6 sm:p-7 rounded-lg border-2 border-[#1a3a5f] artistic-box-shadow max-h-[90vh] overflow-y-auto sketch-scrollbar font-clean text-[#1a3a5f]"
        style={{
          borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
        }}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Top sticky tape */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-blue-100/90 border border-blue-200/90 shadow-xs"></div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 ${
            isAr ? 'left-4' : 'right-4'
          } p-1.5 text-[#1a3a5f] hover:text-[#cc3333] rounded-full transition-colors cursor-pointer`}
          aria-label="Close rules"
        >
          <X size={22} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-[#1a3a5f] border-dashed">
          <HelpCircle size={26} className="text-[#1a3a5f]" />
          <h3 className="text-2xl font-extrabold font-cairo text-[#1a3a5f]">
            {isAr ? 'دليل المعركة البحرية والأسلحة' : 'Naval Field Manual & Weapons'}
          </h3>
        </div>

        {/* Rules & Explanations */}
        <div className="space-y-4 text-sm sm:text-base leading-relaxed">
          {/* Section 1: Fleet */}
          <div className="bg-white/80 p-3.5 rounded-lg border-2 border-[#1a3a5f]/30">
            <h4 className="font-bold text-base sm:text-lg text-[#1a3a5f] font-cairo flex items-center gap-2 mb-1">
              <Anchor size={18} className="text-[#1a3a5f]" />
              <span>{isAr ? '1. نشر وتوزيع الأسطول' : '1. Fleet Deployment'}</span>
            </h4>
            <p className="opacity-90 text-xs sm:text-sm">
              {isAr
                ? 'قم بتوزيع سفنك الـ 5 الحربية على شبكة الدفاع البحرية (10×10 مربعات):'
                : 'Position all 5 naval vessels on your 10x10 squared grid:'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 font-cairo font-bold text-xs">
              <div className="p-1.5 bg-[#d1e4f0]/40 rounded border border-[#1a3a5f]/30">
                🚢 {isAr ? 'حاملة الطائرات (5 مربعات)' : 'Carrier (5 cells)'}
              </div>
              <div className="p-1.5 bg-[#d1e4f0]/40 rounded border border-[#1a3a5f]/30">
                ⚓ {isAr ? 'البارجة الحربية (4 مربعات)' : 'Battleship (4 cells)'}
              </div>
              <div className="p-1.5 bg-[#d1e4f0]/40 rounded border border-[#1a3a5f]/30">
                🛡️ {isAr ? 'الطراد المدرع (3 مربعات)' : 'Cruiser (3 cells)'}
              </div>
              <div className="p-1.5 bg-[#d1e4f0]/40 rounded border border-[#1a3a5f]/30">
                🌊 {isAr ? 'الغواصة (3 مربعات)' : 'Submarine (3 cells)'}
              </div>
              <div className="p-1.5 bg-[#d1e4f0]/40 rounded border border-[#1a3a5f]/30">
                ⚡ {isAr ? 'المدمرة (2 مربعات)' : 'Destroyer (2 cells)'}
              </div>
            </div>
          </div>

          {/* Section 2: Special Weapons (Planes & Torpedoes) */}
          <div className="bg-amber-50/80 p-3.5 rounded-lg border-2 border-amber-600/40">
            <h4 className="font-bold text-base sm:text-lg text-amber-900 font-cairo flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-amber-700" />
              <span>{isAr ? '2. ما هي الطائرات والطوربيدات وكيف تعمل؟' : '2. What are Airstrikes & Torpedoes?'}</span>
            </h4>
            
            <div className="space-y-2.5 mt-2">
              {/* Airstrike */}
              <div className="bg-white/90 p-2.5 rounded border border-amber-400/60 flex items-start gap-2.5">
                <PlaneDoodle size={28} className="text-amber-700 shrink-0 mt-1" />
                <div>
                  <h5 className="font-bold font-cairo text-sm text-[#1a3a5f]">
                    {isAr ? '✈️ الضربة الجوية / الطائرات (Airstrike)' : '✈️ Airstrike Recon & Bombing'}
                  </h5>
                  <p className="text-xs opacity-90 mt-0.5">
                    {isAr
                      ? 'تستدعي طائرة حربية تحلّق فوق رادار العدو وتقصف منطقة متقاطعة كاملة (5 مربعات: المركز وما حوله) لكشف وإصابة قطع أسطول العدو دفعة واحدة!'
                      : 'Calls in a warplane that flies over enemy radar, dropping bombs across a cross pattern (5 cells) to uncover and hit enemy formations simultaneously!'}
                  </p>
                </div>
              </div>

              {/* Torpedo */}
              <div className="bg-white/90 p-2.5 rounded border border-cyan-400/60 flex items-start gap-2.5">
                <TorpedoDoodle size={28} className="text-cyan-700 shrink-0 mt-1" />
                <div>
                  <h5 className="font-bold font-cairo text-sm text-[#1a3a5f]">
                    {isAr ? '🚀 الطوربيد البحري (Torpedo Strike)' : '🚀 Torpedo Line Strike'}
                  </h5>
                  <p className="text-xs opacity-90 mt-0.5">
                    {isAr
                      ? 'مقذوف بحري تحت الماء ينطلق بسرعة عالية عبر خط أفقي كامل (أو رأسي) لمسح صف كامل وتفجير أي سفينة معادية تتواجد في مساره!'
                      : 'An underwater high-speed projectile that sweeps across an entire row or column, striking every unrevealed cell in that trajectory!'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Audio & Sound Effects */}
          <div className="bg-[#d1e4f0]/30 p-3.5 rounded-lg border-2 border-[#1a3a5f]/30">
            <h4 className="font-bold text-base sm:text-lg text-[#1a3a5f] font-cairo flex items-center gap-2 mb-1">
              <Volume2 size={18} className="text-[#1a3a5f]" />
              <span>{isAr ? '3. المؤثرات الصوتية الواقعية' : '3. Realistic Sound Effects'}</span>
            </h4>
            <ul className="text-xs sm:text-sm space-y-1 opacity-90">
              <li>🚀 <strong>{isAr ? 'صوت رحلة الصاروخ في الهواء:' : 'Missile Flight Sound:'}</strong> {isAr ? 'هدير المحرك وصفير الصاروخ أثناء تحليقه نحو الهدف.' : 'Rocket engine whoosh and falling whistle trajectory.'}</li>
              <li>💥 <strong>{isAr ? 'صوت الانفجار:' : 'Explosion Blast:'}</strong> {isAr ? 'دوي انفجار قوي وتردد هزات معدنية عند إصابة السفينة مباشرة أو إغراقها.' : 'Heavy explosive detonation and metal hull crunch on direct hits.'}</li>
              <li>🌊 <strong>{isAr ? 'صوت الاصطدام ورذاذ الماء:' : 'Water Splash Impact:'}</strong> {isAr ? 'صوت ارتطام القذيفة بسطح المحيط وتناثر قطرات الماء عند الخطأ.' : 'Hydrodynamic splash and water bubble resonance on misses.'}</li>
            </ul>
          </div>
        </div>

        {/* Dismiss button */}
        <div className="mt-5 pt-3 border-t-2 border-[#1a3a5f] border-dashed flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-6 bg-[#1a3a5f] text-white hover:bg-[#0f233a] rounded border-2 border-[#1a3a5f] artistic-box-shadow font-cairo font-bold text-sm transition-all cursor-pointer"
            style={{
              borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
            }}
          >
            {isAr ? 'فهمت التعليمات، إلى المعركة!' : 'READY FOR BATTLE!'}
          </button>
        </div>
      </div>
    </div>
  );
};
