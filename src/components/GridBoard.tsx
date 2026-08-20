import React from 'react';
import { CellData, PlacedShip, WeaponType } from '../types';
import { ROW_LABELS, COL_LABELS, getShipCoordinates } from '../utils/gameLogic';
import {
  PenHitCross,
  PenMissDot,
  SunkScribble,
  ShipSilhouette,
  ExplosionVisual,
  SplashVisual,
  PlaneDoodle,
  TorpedoDoodle,
} from './HandDrawnIcons';

interface GridBoardProps {
  id?: string;
  title: string;
  subTitle?: string;
  grid: CellData[][];
  placedShips: PlacedShip[];
  showShips?: boolean;
  isInteractive?: boolean;
  onCellClick?: (x: number, y: number) => void;
  onCellHover?: (x: number, y: number) => void;
  onCellLeave?: () => void;
  previewCoords?: { x: number; y: number }[];
  previewValid?: boolean;
  disabled?: boolean;
  badge?: string;
  turnHighlight?: boolean;
  activeWeapon?: WeaponType;
  animatingCell?: { x: number; y: number; type: 'rocket' | 'explosion' | 'splash' } | null;
  torpedoLine?: { index: number; direction: 'row' | 'col' } | null;
  showPlaneFlyover?: boolean;
  isRtl?: boolean;
}

export const GridBoard: React.FC<GridBoardProps> = ({
  id,
  title,
  subTitle,
  grid,
  placedShips,
  showShips = false,
  isInteractive = false,
  onCellClick,
  onCellHover,
  onCellLeave,
  previewCoords = [],
  previewValid = true,
  disabled = false,
  badge,
  turnHighlight = false,
  activeWeapon = 'regular',
  animatingCell,
  torpedoLine,
  showPlaneFlyover = false,
}) => {
  const isCellInPreview = (x: number, y: number) => {
    return previewCoords.some(c => c.x === x && c.y === y);
  };

  return (
    <div
      id={id}
      className={`relative flex flex-col p-4 sm:p-5 transition-all duration-300 border-2 border-[#1a3a5f] bg-[#fdfaf5]/90 artistic-box-shadow ${
        turnHighlight ? 'ring-2 ring-[#1a3a5f] bg-[#eef4f9]/90' : ''
      }`}
      style={{
        borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
      }}
    >
      {/* Plane Flyover Animation Banner */}
      {showPlaneFlyover && (
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden flex items-center justify-center">
          <div className="animate-plane-flyover text-[#1a3a5f]">
            <PlaneDoodle size={110} />
          </div>
        </div>
      )}

      {/* Board Header Banner */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b-2 border-[#1a3a5f] border-dashed">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-wide text-[#1a3a5f] font-cairo">
              {title}
            </h3>
            {badge && (
              <span className="px-2.5 py-0.5 text-xs font-bold border-2 border-[#1a3a5f] text-[#1a3a5f] bg-white font-clean sketch-border">
                {badge}
              </span>
            )}
          </div>
          {subTitle && (
            <p className="text-xs sm:text-sm text-[#1a3a5f] opacity-85 font-clean mt-0.5">
              {subTitle}
            </p>
          )}
        </div>

        {/* Status indicator note */}
        {turnHighlight && (
          <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#cc3333] bg-red-50 border-2 border-[#cc3333] rounded sketch-border-red">
            <span className="w-2 h-2 rounded-full bg-[#cc3333] animate-ping"></span>
            <span className="font-cairo tracking-wider">
              {activeWeapon === 'airstrike'
                ? 'طائرة الاستطلاع'
                : activeWeapon === 'torpedo'
                ? 'إطلاق الطوربيد'
                : 'دورك للإطلاق'}
            </span>
          </div>
        )}
      </div>

      {/* Grid Container */}
      <div className="relative mx-auto select-none">
        {/* Column Labels (1 - 10) */}
        <div className="grid grid-cols-11 mb-1 text-center font-bold text-sm sm:text-base text-[#1a3a5f] font-display">
          <div className="w-7 sm:w-9"></div>
          {COL_LABELS.map(col => (
            <div
              key={col}
              className="w-7 h-6 sm:w-9 sm:h-7 flex items-center justify-center"
            >
              {col}
            </div>
          ))}
        </div>

        {/* Main Grid with Row Labels (A - J) */}
        <div className="relative border-2 border-[#1a3a5f] bg-white/70 artistic-box-shadow-sm overflow-hidden">
          {/* Torpedo Sweep Line Visual */}
          {torpedoLine && (
            <div
              className={`absolute pointer-events-none z-30 bg-blue-400/40 border-2 border-dashed border-[#1a3a5f] animate-torpedo-sweep flex items-center justify-center ${
                torpedoLine.direction === 'row'
                  ? 'left-7 sm:left-9 right-0 h-7 sm:h-9'
                  : 'top-0 bottom-0 w-7 sm:w-9'
              }`}
              style={{
                top:
                  torpedoLine.direction === 'row'
                    ? `${torpedoLine.index * (window.innerWidth < 640 ? 28 : 36)}px`
                    : 0,
                left:
                  torpedoLine.direction === 'col'
                    ? `${(window.innerWidth < 640 ? 28 : 36) * (torpedoLine.index + 1)}px`
                    : undefined,
              }}
            >
              <TorpedoDoodle size={20} className="text-[#1a3a5f] animate-pulse" />
            </div>
          )}

          {grid.map((row, y) => (
            <div key={y} className="flex">
              {/* Row Label (A, B, C...) */}
              <div className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center font-bold text-sm sm:text-base text-[#1a3a5f] font-display border-r border-[#1a3a5f]/25 bg-[#d1e4f0]/30 shrink-0">
                {ROW_LABELS[y]}
              </div>

              {/* Row Cells */}
              <div className="flex">
                {row.map((cell, x) => {
                  const inPreview = isCellInPreview(x, y);
                  const isHit = cell.status === 'hit';
                  const isMiss = cell.status === 'miss';
                  const hasShip =
                    cell.status === 'ship' ||
                    placedShips.some(s =>
                      getShipCoordinates(s.x, s.y, s.size, s.orientation).some(
                        c => c.x === x && c.y === y
                      )
                    );
                  const isSunk = !!cell.sunkShipId;
                  const isClickable =
                    isInteractive &&
                    !disabled &&
                    cell.status !== 'hit' &&
                    cell.status !== 'miss';

                  // Dynamic preview styling based on weapon
                  let previewBg = '';
                  if (inPreview) {
                    if (!previewValid) {
                      previewBg = 'bg-red-200/80 border-2 border-[#cc3333]';
                    } else if (activeWeapon === 'airstrike') {
                      previewBg = 'bg-amber-200/80 border-2 border-amber-600';
                    } else if (activeWeapon === 'torpedo') {
                      previewBg = 'bg-cyan-200/80 border-2 border-cyan-700';
                    } else {
                      previewBg = 'bg-[#d1e4f0]/90 border-2 border-[#1a3a5f]';
                    }
                  }

                  const isCurrentAnimating =
                    animatingCell &&
                    animatingCell.x === x &&
                    animatingCell.y === y;

                  return (
                    <button
                      key={`${x}-${y}`}
                      type="button"
                      disabled={!isClickable && !inPreview}
                      onClick={() => onCellClick && onCellClick(x, y)}
                      onMouseEnter={() => onCellHover && onCellHover(x, y)}
                      onMouseLeave={() => onCellLeave && onCellLeave()}
                      className={`
                        relative w-7 h-7 sm:w-9 sm:h-9
                        border border-[#1a3a5f]/20
                        transition-all duration-100 flex items-center justify-center
                        ${
                          isClickable
                            ? 'cursor-crosshair hover:bg-[#d1e4f0]/60 hover:scale-105 active:scale-95'
                            : 'cursor-default'
                        }
                        ${cell.isRecent ? 'bg-amber-100/80' : 'bg-transparent'}
                        ${previewBg}
                      `}
                      title={`${ROW_LABELS[y]}${x + 1}`}
                      aria-label={`Cell ${ROW_LABELS[y]}${x + 1} ${cell.status}`}
                    >
                      {/* Active Animation on cell */}
                      {isCurrentAnimating && animatingCell.type === 'rocket' && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center animate-rocket-impact pointer-events-none">
                          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-md"></div>
                        </div>
                      )}

                      {isCurrentAnimating && animatingCell.type === 'explosion' && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                          <ExplosionVisual size={36} />
                        </div>
                      )}

                      {isCurrentAnimating && animatingCell.type === 'splash' && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                          <SplashVisual size={32} />
                        </div>
                      )}

                      {/* Ship placement indicator */}
                      {showShips && hasShip && !isHit && !inPreview && (
                        <div className="absolute inset-0.5 rounded-xs bg-[#1a3a5f]/20 border border-[#1a3a5f]/50 pen-hatch flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-[#1a3a5f]/70"></span>
                        </div>
                      )}

                      {/* Hit marker (Red X) */}
                      {isHit && (
                        <div className="relative z-10">
                          <PenHitCross size={26} />
                        </div>
                      )}

                      {/* Miss marker (Navy Dot) */}
                      {isMiss && (
                        <div className="relative z-10">
                          <PenMissDot size={22} />
                        </div>
                      )}

                      {/* Sunk Ship Overlay Scribble */}
                      {isSunk && isHit && (
                        <div className="absolute inset-0 bg-red-100/40 pointer-events-none">
                          <SunkScribble />
                        </div>
                      )}

                      {/* Hover weapon crosshair */}
                      {isClickable && !inPreview && (
                        <div className="opacity-0 hover:opacity-100 absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-2.5 h-2.5 rounded-full border border-[#1a3a5f] bg-[#d1e4f0]"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Render Full Ship Silhouettes on Player Board */}
          {showShips && (
            <div className="absolute top-0 left-7 sm:left-9 w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] pointer-events-none z-0">
              {placedShips.map(ship => {
                const cellSize = 10;
                const left = `${ship.x * cellSize}%`;
                const top = `${ship.y * cellSize}%`;
                const width =
                  ship.orientation === 'horizontal'
                    ? `${ship.size * cellSize}%`
                    : `${cellSize}%`;
                const height =
                  ship.orientation === 'vertical'
                    ? `${ship.size * cellSize}%`
                    : `${cellSize}%`;

                return (
                  <div
                    key={ship.id}
                    className="absolute p-0.5 transition-all duration-300"
                    style={{ left, top, width, height }}
                  >
                    <ShipSilhouette
                      size={ship.size}
                      orientation={ship.orientation}
                      isSunk={ship.sunk}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Render Sunk Ships on Enemy Radar */}
          {!showShips && (
            <div className="absolute top-0 left-7 sm:left-9 w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] pointer-events-none z-0">
              {placedShips
                .filter(s => s.sunk)
                .map(ship => {
                  const cellSize = 10;
                  const left = `${ship.x * cellSize}%`;
                  const top = `${ship.y * cellSize}%`;
                  const width =
                    ship.orientation === 'horizontal'
                      ? `${ship.size * cellSize}%`
                      : `${cellSize}%`;
                  const height =
                    ship.orientation === 'vertical'
                      ? `${ship.size * cellSize}%`
                      : `${cellSize}%`;

                  return (
                    <div
                      key={ship.id}
                      className="absolute p-0.5 animate-in fade-in zoom-in duration-300"
                      style={{ left, top, width, height }}
                    >
                      <ShipSilhouette
                        size={ship.size}
                        orientation={ship.orientation}
                        isSunk={true}
                      />
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
