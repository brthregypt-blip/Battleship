import React from 'react';
import { ShipType, PlacedShip, Orientation, Language } from '../types';
import { DEFAULT_SHIPS } from '../utils/gameLogic';
import { RotateCw, Check } from 'lucide-react';

interface ShipRosterProps {
  title: string;
  ships: PlacedShip[];
  selectedShipId?: string | null;
  orientation?: Orientation;
  isPlacementMode?: boolean;
  onSelectShip?: (ship: ShipType) => void;
  onRotate?: () => void;
  onRemoveShip?: (shipId: string) => void;
  lang?: Language;
}

export const ShipRoster: React.FC<ShipRosterProps> = ({
  title,
  ships,
  selectedShipId,
  orientation = 'horizontal',
  isPlacementMode = false,
  onSelectShip,
  onRotate,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';
  const sunkCount = ships.filter(s => s.sunk).length;

  return (
    <div
      className="bg-[#fdfaf5]/90 border-2 border-[#1a3a5f] p-3 sm:p-4 artistic-box-shadow"
      style={{
        borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
      }}
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-[#1a3a5f] border-dashed">
        <h4 className="text-base sm:text-lg font-bold text-[#1a3a5f] font-cairo flex items-center gap-1.5">
          <span>{title}</span>
          <span className="text-xs text-[#1a3a5f] opacity-80 font-clean font-normal">
            ({ships.length - sunkCount}/{DEFAULT_SHIPS.length}{' '}
            {isAr ? 'عائمة' : 'afloat'})
          </span>
        </h4>

        {isPlacementMode && onRotate && (
          <button
            type="button"
            onClick={onRotate}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#1a3a5f] bg-white border-2 border-[#1a3a5f] rounded artistic-btn font-cairo cursor-pointer"
            title={isAr ? 'تدوير السفينة (أو اضغط R)' : 'Rotate Ship (or press R)'}
          >
            <RotateCw size={13} />
            <span>
              {orientation === 'horizontal'
                ? isAr
                  ? 'أفقي (R)'
                  : 'HORIZ (R)'
                : isAr
                ? 'رأسي (R)'
                : 'VERT (R)'}
            </span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {DEFAULT_SHIPS.map(def => {
          const placed = ships.find(s => s.shipId === def.id);
          const isSelected = selectedShipId === def.id;
          const isSunk = placed?.sunk || false;
          const hits = placed?.hits || 0;
          const displayName = isAr ? def.nameAr : def.name;

          return (
            <div
              key={def.id}
              onClick={() => {
                if (isPlacementMode && onSelectShip) {
                  onSelectShip(def);
                }
              }}
              className={`
                relative p-2.5 rounded transition-all duration-150 flex items-center justify-between border-2
                ${
                  isPlacementMode
                    ? 'cursor-pointer hover:bg-[#d1e4f0]/50 active:scale-[0.99]'
                    : 'cursor-default'
                }
                ${
                  isSelected
                    ? 'bg-[#d1e4f0]/80 border-[#1a3a5f] shadow-sm'
                    : 'bg-white/80 border-[#1a3a5f]/40'
                }
                ${isSunk ? 'bg-red-50/80 border-[#cc3333] opacity-75' : ''}
              `}
              style={{
                borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
              }}
            >
              {/* Ship name and size */}
              <div className="flex items-center gap-2">
                <span
                  className={`font-cairo text-sm sm:text-base font-bold ${
                    isSunk
                      ? 'text-[#cc3333] line-through decoration-[#cc3333]'
                      : 'text-[#1a3a5f]'
                  }`}
                >
                  {displayName} <span className="font-display">[{def.size}]</span>
                </span>

                {isPlacementMode && placed && (
                  <span className="text-emerald-800 text-xs flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-400 font-clean font-bold">
                    <Check size={11} /> {isAr ? 'تم النشر' : 'Placed'}
                  </span>
                )}
              </div>

              {/* Pegs / Damage indicators */}
              <div className="flex items-center gap-1">
                {Array.from({ length: def.size }).map((_, i) => {
                  const isHitPeg = i < hits;
                  return (
                    <div
                      key={i}
                      className={`
                        w-4 h-4 sm:w-5 sm:h-5 rounded-xs border-2 flex items-center justify-center text-[10px] font-bold font-display
                        ${
                          isSunk
                            ? 'border-[#cc3333] bg-red-100 text-[#cc3333]'
                            : isHitPeg
                            ? 'border-[#cc3333] bg-red-200 text-[#cc3333]'
                            : 'border-[#1a3a5f] bg-white/80 text-[#1a3a5f]'
                        }
                      `}
                    >
                      {isHitPeg || isSunk ? 'X' : '•'}
                    </div>
                  );
                })}

                {/* Sunk badge stamp */}
                {isSunk && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-[#cc3333] border-2 border-[#cc3333] rounded sketch-border-red font-cairo bg-red-50">
                    {isAr ? 'غرقت' : 'SUNK'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
